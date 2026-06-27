import { MaterialEntity, ProjectEntity } from "@/typings";
import { DBSchema, IDBPDatabase, openDB } from "idb";

interface VideoManagerDB extends DBSchema {
  projects: {
    key: number;
    value: ProjectEntity;
    indexes: { "updatedAt": number };
  };
  materials: {
    key: number;
    value: MaterialEntity;
    indexes: { "projectId": number; "updatedAt": number; "deletedAt": number };
  };
}

const DB_NAME = "video-manager-db";
const DB_VERSION = 4;

let dbPromise: Promise<IDBPDatabase<VideoManagerDB>>;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VideoManagerDB>(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, _newVersion, transaction) {
        let projectStore;
        if (!db.objectStoreNames.contains("projects")) {
          projectStore = db.createObjectStore("projects", {
            keyPath: "id",
            autoIncrement: true,
          });
        } else {
          projectStore = transaction.objectStore("projects");
        }
        
        if (!projectStore.indexNames.contains("updatedAt")) {
          projectStore.createIndex("updatedAt", "updatedAt");
        }

        let materialStore;
        if (!db.objectStoreNames.contains("materials")) {
          materialStore = db.createObjectStore("materials", {
            keyPath: "id",
            autoIncrement: true,
          });
        } else {
          materialStore = transaction.objectStore("materials");
        }

        if (!materialStore.indexNames.contains("projectId")) {
          materialStore.createIndex("projectId", "projectId");
        }
        if (!materialStore.indexNames.contains("updatedAt")) {
          materialStore.createIndex("updatedAt", "updatedAt");
        }

        // Migration for version 3: Add status field to existing materials
        if (oldVersion < 3) {
          const materials = await materialStore.getAll();
          for (const material of materials) {
            if (!material.status) {
              material.status = 'unused';
              await materialStore.put(material);
            }
          }
        }

        // Migration for version 4: Add deletedAt index for recycle bin
        if (oldVersion < 4) {
          if (!materialStore.indexNames.contains("deletedAt")) {
            materialStore.createIndex("deletedAt", "deletedAt");
          }
        }
      },
    });
  }
  return dbPromise;
}

export const db = {
  getProjects: async () => {
    const db = await getDB();
    const projects = await db.getAllFromIndex("projects", "updatedAt");
    const projectsWithCount = await Promise.all(
      projects.map(async (p) => {
        const materials = await db.getAllFromIndex("materials", "projectId", p.id);
        const activeMaterials = materials.filter((m) => !m.deletedAt);
        const tags = [...new Set(activeMaterials.flatMap((m) => m.tags ?? []))];
        return { ...p, resourcesCount: activeMaterials.length, tags };
      })
    );
    return projectsWithCount.reverse();
  },
  getProject: async (id: number) => {
    const db = await getDB();
    return db.get("projects", id);
  },
  saveProject: async (project: Partial<ProjectEntity>) => {
    const db = await getDB();
    const now = Date.now();
    
    let data: ProjectEntity;
    
    if (project.id) {
      // If id exists, fetch existing project and merge
      const existingProject = await db.get("projects", project.id);
      if (!existingProject) {
        throw new Error('Project not found');
      }
      data = { ...existingProject, ...project, updatedAt: now } as ProjectEntity;
    } else {
      // If no id, create new project
      data = { ...project, createdAt: now, updatedAt: now } as ProjectEntity;
    }
    
    const id = await db.put("projects", data);
    return { ...data, id };
  },
  deleteProject: async (id: number) => {
    const db = await getDB();
    await db.delete("projects", id);
    // Also delete related materials
    const tx = db.transaction("materials", "readwrite");
    const index = tx.store.index("projectId");
    let cursor = await index.openCursor(IDBKeyRange.only(id));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
    return id;
  },
  getMaterials: async () => {
    const db = await getDB();
    const materials = await db.getAllFromIndex("materials", "updatedAt");
    return materials.reverse();
  },
  getProjectMaterials: async (projectId: number) => {
    const db = await getDB();
    const materials = await db.getAllFromIndex(
      "materials",
      "projectId",
      projectId
    );
    return materials
      .filter((m) => !m.deletedAt)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
  getMaterial: async (id: number): Promise<MaterialEntity | undefined> => {
    const db = await getDB();
    return db.get("materials", id);
  },
  saveMaterial: async (material: Partial<MaterialEntity>) => {
    const db = await getDB();
    const now = Date.now();
    
    let data: MaterialEntity;
    
    if (material.id) {
      // If id exists, fetch existing material and merge
      const existingMaterial = await db.get("materials", material.id);
      if (!existingMaterial) {
        throw new Error('Material not found');
      }
      data = { ...existingMaterial, ...material, updatedAt: now } as MaterialEntity;
    } else {
      // If no id, create new material
      data = { ...material, createdAt: now, updatedAt: now } as MaterialEntity;
      if (!data.status) {
        data.status = 'unused';
      }
    }
    
    const id = await db.put("materials", data);
    return { ...data, id };
  },
  deleteMaterial: async (id: number) => {
    const db = await getDB();
    await db.delete("materials", id);
    return id;
  },
  trashMaterial: async (id: number) => {
    const db = await getDB();
    const material = await db.get("materials", id);
    if (!material) throw new Error("Material not found");
    material.deletedAt = Date.now();
    material.updatedAt = material.deletedAt;
    await db.put("materials", material);
    return id;
  },
  restoreMaterial: async (id: number) => {
    const db = await getDB();
    const material = await db.get("materials", id);
    if (!material) throw new Error("Material not found");
    delete material.deletedAt;
    material.updatedAt = Date.now();
    await db.put("materials", material);
    return id;
  },
  getTrashMaterials: async (): Promise<MaterialEntity[]> => {
    const db = await getDB();
    const deleted: MaterialEntity[] = [];
    let cursor = await db
      .transaction("materials")
      .store.index("deletedAt")
      .openCursor(IDBKeyRange.lowerBound(1));
    while (cursor) {
      deleted.push(cursor.value);
      cursor = await cursor.continue();
    }
    return deleted.sort(
      (a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)
    );
  },
  emptyTrash: async (options?: { deleteNative?: boolean }) => {
    const database = await getDB();
    const paths: string[] = [];
    const tx = database.transaction("materials", "readwrite");
    let cursor = await tx.store
      .index("deletedAt")
      .openCursor(IDBKeyRange.lowerBound(1));
    while (cursor) {
      paths.push(cursor.value.path);
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
    if (options?.deleteNative) {
      for (const path of paths) {
        try {
          await db.deleteNativeFile(path);
        } catch {
          // silently skip individual file deletion errors during bulk empty
        }
      }
    }
  },
  getMaterialsByPath: async (filePath: string): Promise<MaterialEntity[]> => {
    const db = await getDB();
    const allMaterials = await db.getAll("materials");
    return allMaterials.filter((m) => m.path === filePath);
  },
  deleteNativeFile: async (filePath: string): Promise<{ success: boolean; error?: string }> => {
    return window.ipcRenderer.invoke("app:delete-native-file", filePath) as Promise<{ success: boolean; error?: string }>;
  },
  addMaterialDialog: async (projectId: number) => {
    // Call IPC to get file paths
    const files = (await window.ipcRenderer.invoke(
      "app:add-material-dialog"
    )) as { name: string; path: string; size: number }[];
    if (!files || files.length === 0) return [];

    const savedMaterials: MaterialEntity[] = [];
    for (const file of files) {
      const material = await db.saveMaterial({
        projectId,
        name: file.name,
        path: file.path,
        size: file.size,
      });
      savedMaterials.push(material);
    }
    return savedMaterials;
  },
  openFileLocation: (path: string) =>
    window.ipcRenderer.invoke("app:open-file-location", path) as Promise<void>,
  startDrag: (paths: string | string[]) =>
    window.ipcRenderer.send("app:start-drag", paths),
};
