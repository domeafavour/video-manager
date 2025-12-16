import { MaterialEntity, ProjectEntity } from "@/typings";
import { DBSchema, IDBPDatabase, openDB } from "idb";

interface VideoManagerDB extends DBSchema {
  projects: {
    key: number;
    value: ProjectEntity;
    indexes: { "by-updatedAt": number };
  };
  materials: {
    key: number;
    value: MaterialEntity;
    indexes: { "by-projectId": number; "by-updatedAt": number };
  };
}

const DB_NAME = "video-manager-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<VideoManagerDB>>;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VideoManagerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const projectStore = db.createObjectStore("projects", {
          keyPath: "id",
          autoIncrement: true,
        });
        projectStore.createIndex("by-updatedAt", "updatedAt");

        const materialStore = db.createObjectStore("materials", {
          keyPath: "id",
          autoIncrement: true,
        });
        materialStore.createIndex("by-projectId", "projectId");
        materialStore.createIndex("by-updatedAt", "updatedAt");
      },
    });
  }
  return dbPromise;
}

export const db = {
  getProjects: async () => {
    const db = await getDB();
    const projects = await db.getAllFromIndex("projects", "by-updatedAt");
    const projectsWithCount = await Promise.all(
      projects.map(async (p) => {
        const count = await db.countFromIndex("materials", "by-projectId", p.id);
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
    const index = tx.store.index("by-projectId");
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
    const materials = await db.getAllFromIndex("materials", "by-updatedAt");
    return materials.reverse();
  },
  getProjectMaterials: async (projectId: number) => {
    const db = await getDB();
    const materials = await db.getAllFromIndex(
      "materials",
      "by-projectId",
      projectId
    );
    return materials.sort((a, b) => b.updatedAt - a.updatedAt);
  },
  saveMaterial: async (material: Partial<MaterialEntity>) => {
    const db = await getDB();
    const now = Date.now();
    const data = { ...material, updatedAt: now } as MaterialEntity;
    if (!data.id) {
      data.createdAt = now;
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
