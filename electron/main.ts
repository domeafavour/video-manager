import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { initDB, getProjects, getProject, saveProject, deleteProject, getMaterials, getProjectMaterials, saveMaterial, deleteMaterial, ProjectEntity, MaterialEntity } from './db'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: false,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

ipcMain.handle('db:get-projects', () => {
  return getProjects()
})

ipcMain.handle('db:get-project', (_, id: number) => {
  return getProject(id)
})

ipcMain.handle('db:save-project', (_, project: ProjectEntity) => {
  return saveProject(project)
})

ipcMain.handle('db:delete-project', (_, id: number) => {
  return deleteProject(id)
})

ipcMain.handle('db:get-materials', () => {
  return getMaterials()
})

ipcMain.handle('db:get-project-materials', (_, projectId: number) => {
  return getProjectMaterials(projectId)
})

ipcMain.handle('app:add-material-dialog', async (_, projectId: number) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  })
  if (canceled || filePaths.length === 0) {
    return []
  }

  const materials: MaterialEntity[] = []
  for (const filePath of filePaths) {
    const stats = fs.statSync(filePath)
    const name = path.basename(filePath)
    const material = saveMaterial({
      projectId,
      name,
      path: filePath,
      size: stats.size,
    })
    materials.push(material)
  }
  return materials
})

ipcMain.handle('db:save-material', (_, material: MaterialEntity) => {
  return saveMaterial(material)
})

ipcMain.handle('db:delete-material', (_, id: number) => {
  return deleteMaterial(id)
})

ipcMain.handle('app:open-file-location', (_, filePath: string) => {
  shell.showItemInFolder(filePath)
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  initDB()
  createWindow()
})
