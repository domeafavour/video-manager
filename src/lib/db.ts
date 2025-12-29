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
    indexes: { "projectId": number; "updatedAt": number };
  };
}

const DB_NAME = "video-manager-db";
const DB_VERSION = 3;

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
        const count = await db.countFromIndex("materials", "projectId", p.id);
        return { ...p, resourcesCount: count };
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
    const data = { ...project, updatedAt: now } as ProjectEntity;
    if (!data.id) {
      data.createdAt = now;
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
    return materials.sort((a, b) => b.updatedAt - a.updatedAt);
  },
  getMaterial: async (id: number) => {
    const db = await getDB();
    return db.get("materials", id);
  },
  saveMaterial: async (material: Partial<MaterialEntity>) => {
    const db = await getDB();
    const now = Date.now();
    const data = { ...material, updatedAt: now } as MaterialEntity;
    if (!data.id) {
      data.createdAt = now;
    }
    if (!data.status) {
      data.status = 'unused';
    }
    const id = await db.put("materials", data);
    return { ...data, id };
  },
  deleteMaterial: async (id: number) => {
    const db = await getDB();
    await db.delete("materials", id);
    return id;
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
  startDrag: (path: string) => window.ipcRenderer.send("app:start-drag", path),
};
