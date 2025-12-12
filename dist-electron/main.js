import { app, ipcMain, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Database from "better-sqlite3";
const DB_NAME = "database.sqlite";
let db;
function initDB() {
  const dbPath = path.join(app.getPath("userData"), DB_NAME);
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      alias TEXT,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
    );
  `);
}
function getProjects() {
  return db.prepare("SELECT * FROM projects ORDER BY updatedAt DESC").all();
}
function saveProject(project) {
  const now = Date.now();
  if (project.id) {
    const stmt = db.prepare(`
      UPDATE projects 
      SET title = @title, updatedAt = @updatedAt
      WHERE id = @id
    `);
    stmt.run({ ...project, updatedAt: now });
    return { ...project, updatedAt: now };
  } else {
    const stmt = db.prepare(`
      INSERT INTO projects (title, createdAt, updatedAt)
      VALUES (@title, @createdAt, @updatedAt)
    `);
    const info = stmt.run({ ...project, createdAt: now, updatedAt: now });
    return { ...project, id: Number(info.lastInsertRowid), createdAt: now, updatedAt: now };
  }
}
function deleteProject(id) {
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  return id;
}
function getMaterials() {
  return db.prepare("SELECT * FROM materials ORDER BY updatedAt DESC").all();
}
function saveMaterial(material) {
  const now = Date.now();
  if (material.id) {
    const stmt = db.prepare(`
      UPDATE materials 
      SET projectId = @projectId, alias = @alias, name = @name, size = @size, path = @path, updatedAt = @updatedAt
      WHERE id = @id
    `);
    stmt.run({ ...material, updatedAt: now });
    return { ...material, updatedAt: now };
  } else {
    const stmt = db.prepare(`
      INSERT INTO materials (projectId, alias, name, size, path, createdAt, updatedAt)
      VALUES (@projectId, @alias, @name, @size, @path, @createdAt, @updatedAt)
    `);
    const info = stmt.run({ ...material, createdAt: now, updatedAt: now });
    return { ...material, id: Number(info.lastInsertRowid), createdAt: now, updatedAt: now };
  }
}
function deleteMaterial(id) {
  db.prepare("DELETE FROM materials WHERE id = ?").run(id);
  return id;
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
ipcMain.handle("db:get-projects", () => {
  return getProjects();
});
ipcMain.handle("db:save-project", (_, project) => {
  return saveProject(project);
});
ipcMain.handle("db:delete-project", (_, id) => {
  return deleteProject(id);
});
ipcMain.handle("db:get-materials", () => {
  return getMaterials();
});
ipcMain.handle("db:save-material", (_, material) => {
  return saveMaterial(material);
});
ipcMain.handle("db:delete-material", (_, id) => {
  return deleteMaterial(id);
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  initDB();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
