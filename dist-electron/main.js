import { ipcMain as r, dialog as R, shell as g, nativeImage as h, app as l, BrowserWindow as c } from "electron";
import { fileURLToPath as E } from "node:url";
import e from "node:path";
import _ from "node:fs";
const p = e.dirname(E(import.meta.url));
process.env.APP_ROOT = e.join(p, "..");
const i = process.env.VITE_DEV_SERVER_URL, v = e.join(process.env.APP_ROOT, "dist-electron"), A = e.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = i ? e.join(process.env.APP_ROOT, "public") : A;
let o;
function d() {
  o = new c({
    icon: e.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: e.join(p, "preload.mjs"),
      webSecurity: !1
    }
  }), o.webContents.on("did-finish-load", () => {
    o == null || o.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i ? o.loadURL(i) : o.loadFile(e.join(A, "index.html"));
}
r.handle("app:add-material-dialog", async () => {
  const { canceled: t, filePaths: n } = await R.showOpenDialog({
    properties: ["openFile", "multiSelections"]
  });
  if (t || n.length === 0)
    return [];
  const s = [];
  for (const a of n) {
    const m = _.statSync(a), f = e.basename(a);
    s.push({
      name: f,
      path: a,
      size: m.size
    });
  }
  return s;
});
r.handle("app:open-file-location", (t, n) => {
  g.showItemInFolder(n);
});
r.on("app:start-drag", (t, n) => {
  const s = h.createFromDataURL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
  t.sender.startDrag({
    file: n,
    icon: s
  });
});
l.on("activate", () => {
  c.getAllWindows().length === 0 && d();
});
l.whenReady().then(() => {
  d();
});
export {
  v as MAIN_DIST,
  A as RENDERER_DIST,
  i as VITE_DEV_SERVER_URL
};
