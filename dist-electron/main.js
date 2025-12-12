import { app as l, ipcMain as o, dialog as L, shell as f, BrowserWindow as c } from "electron";
import { fileURLToPath as O } from "node:url";
import n from "node:path";
import h from "node:fs";
import j from "better-sqlite3";
const S = "database.sqlite";
let a;
function _() {
  const e = n.join(l.getPath("userData"), S);
  a = new j(e), a.pragma("journal_mode = WAL"), a.exec(`
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
function D() {
  return a.prepare("SELECT * FROM projects ORDER BY updatedAt DESC").all();
}
function P(e) {
  return a.prepare("SELECT * FROM projects WHERE id = ?").get(e);
}
function b(e) {
  const t = Date.now();
  if (e.id)
    return a.prepare(`
      UPDATE projects 
      SET title = @title, updatedAt = @updatedAt
      WHERE id = @id
    `).run({ ...e, updatedAt: t }), { ...e, updatedAt: t };
  {
    const r = a.prepare(`
      INSERT INTO projects (title, createdAt, updatedAt)
      VALUES (@title, @createdAt, @updatedAt)
    `).run({ ...e, createdAt: t, updatedAt: t });
    return { ...e, id: Number(r.lastInsertRowid), createdAt: t, updatedAt: t };
  }
}
function g(e) {
  return a.prepare("DELETE FROM projects WHERE id = ?").run(e), e;
}
function w() {
  return a.prepare("SELECT * FROM materials ORDER BY updatedAt DESC").all();
}
function U(e) {
  return a.prepare("SELECT * FROM materials WHERE projectId = ? ORDER BY updatedAt DESC").all(e);
}
function u(e) {
  const t = Date.now();
  if (e.id) {
    const d = a.prepare(`
      UPDATE materials 
      SET projectId = @projectId, alias = @alias, name = @name, size = @size, path = @path, updatedAt = @updatedAt
      WHERE id = @id
    `), r = { ...e, updatedAt: t };
    return r.alias === void 0 && (r.alias = null), d.run(r), { ...e, updatedAt: t };
  } else {
    const d = a.prepare(`
      INSERT INTO materials (projectId, alias, name, size, path, createdAt, updatedAt)
      VALUES (@projectId, @alias, @name, @size, @path, @createdAt, @updatedAt)
    `), r = { ...e, createdAt: t, updatedAt: t };
    r.alias === void 0 && (r.alias = null);
    const i = d.run(r);
    return { ...e, id: Number(i.lastInsertRowid), createdAt: t, updatedAt: t };
  }
}
function C(e) {
  return a.prepare("DELETE FROM materials WHERE id = ?").run(e), e;
}
const T = n.dirname(O(import.meta.url));
process.env.APP_ROOT = n.join(T, "..");
const p = process.env.VITE_DEV_SERVER_URL, W = n.join(process.env.APP_ROOT, "dist-electron"), R = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = p ? n.join(process.env.APP_ROOT, "public") : R;
let s;
function A() {
  s = new c({
    icon: n.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: n.join(T, "preload.mjs"),
      webSecurity: !1
    }
  }), s.webContents.on("did-finish-load", () => {
    s == null || s.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), p ? s.loadURL(p) : s.loadFile(n.join(R, "index.html"));
}
o.handle("db:get-projects", () => D());
o.handle("db:get-project", (e, t) => P(t));
o.handle("db:save-project", (e, t) => b(t));
o.handle("db:delete-project", (e, t) => g(t));
o.handle("db:get-materials", () => w());
o.handle("db:get-project-materials", (e, t) => U(t));
o.handle("app:add-material-dialog", async (e, t) => {
  const { canceled: d, filePaths: r } = await L.showOpenDialog({
    properties: ["openFile", "multiSelections"]
  });
  if (d || r.length === 0)
    return [];
  const i = [];
  for (const E of r) {
    const m = h.statSync(E), N = n.basename(E), I = u({
      projectId: t,
      name: N,
      path: E,
      size: m.size
    });
    i.push(I);
  }
  return i;
});
o.handle("db:save-material", (e, t) => u(t));
o.handle("db:delete-material", (e, t) => C(t));
o.handle("app:open-file-location", (e, t) => {
  f.showItemInFolder(t);
});
l.on("activate", () => {
  c.getAllWindows().length === 0 && A();
});
l.whenReady().then(() => {
  _(), A();
});
export {
  W as MAIN_DIST,
  R as RENDERER_DIST,
  p as VITE_DEV_SERVER_URL
};
