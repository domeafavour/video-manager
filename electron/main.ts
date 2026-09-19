import { app, BrowserWindow, ipcMain, dialog, shell, nativeImage } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import ffmpegPath from 'ffmpeg-static'

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

if (VITE_DEV_SERVER_URL) {
  app.commandLine.appendSwitch('remote-debugging-port', '9222')
}

let win: BrowserWindow | null

// ffmpeg-static ships the binary inside the asar when packaged; binaries can't
// be spawned from inside an asar, so resolve to the unpacked copy (a no-op in dev).
const FFMPEG = (ffmpegPath ?? '').replace('app.asar', 'app.asar.unpacked')

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 1024,
    height: 800,
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

ipcMain.handle('app:add-material-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  })
  if (canceled || filePaths.length === 0) {
    return []
  }

  const files = []
  for (const filePath of filePaths) {
    const stats = fs.statSync(filePath)
    const name = path.basename(filePath)
    files.push({
      name,
      path: filePath,
      size: stats.size,
    })
  }
  return files
})

ipcMain.handle('app:open-file-location', (_, filePath: string) => {
  shell.showItemInFolder(filePath)
})

ipcMain.handle('app:delete-native-file', async (_, filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return { success: true }
    }
    return { success: false, error: 'File not found' }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.on('app:start-drag', (event, payload: string | string[]) => {
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
  const files = Array.isArray(payload) ? payload : [payload]
  if (files.length === 0) {
    return
  }

  const dragItem =
    files.length === 1
      ? { file: files[0], icon }
      : ({ files, icon } as unknown as Parameters<Electron.WebContents['startDrag']>[0])

  event.sender.startDrag(dragItem)
})

ipcMain.handle('app:export-clip', async (_event, payload: {
  inputPath: string
  start: number
  end: number
  defaultFileName: string
}) => {
  if (!FFMPEG) return { success: false, error: 'ffmpeg binary not found' }
  if (!fs.existsSync(payload.inputPath)) return { success: false, error: 'Source file not found' }

  const duration = payload.end - payload.start
  if (!(duration > 0)) return { success: false, error: 'Invalid clip range' }

  // Mirror the source container so `-c copy` works across codecs (a .webm with
  // VP9/Opus tracks can't be remuxed to .mp4).
  // Re-encoded to H.264 → always mp4 (H.264 isn't valid in .webm/.ogg).
  const ext = 'mp4'
  const options: Electron.SaveDialogOptions = {
    title: 'Export clip',
    defaultPath: path.join(path.dirname(payload.inputPath), payload.defaultFileName),
    filters: [{ name: 'Video', extensions: [ext] }],
  }
  const saved = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options)
  if (saved.canceled || !saved.filePath) return { canceled: true }

  const outputPath = saved.filePath
  // Compare canonicalized paths (case + symlinks) so `-y` can never overwrite
  // the source in place on case-insensitive filesystems.
  const inputReal = fs.realpathSync(payload.inputPath)
  const outputReal = fs.existsSync(outputPath) ? fs.realpathSync(outputPath) : outputPath
  if (outputReal === inputReal) {
    return { success: false, error: 'Output file must differ from the source' }
  }

  // Frame-accurate lossless cuts are impossible: `-c copy` can't start between
  // keyframes without leading black frames (Chromium shows black until the next
  // keyframe). Re-encode to H.264 so the output begins with a fresh keyframe at
  // the exact mark — no black, frame-accurate. `-ss` before -i keeps the seek
  // fast (keyframe jump + decode-and-discard is frame-accurate when re-encoding).
  // -y avoids the overwrite prompt hanging when the save dialog replaced a file.
  const args = [
    '-y',
    '-ss', String(payload.start),
    '-i', payload.inputPath,
    '-map', '0',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
    '-c:a', 'copy',
    '-t', String(duration),
    outputPath,
  ]

  return new Promise((resolve) => {
    const proc = spawn(FFMPEG, args)
    let stderr = ''
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('error', (err) => resolve({ success: false, error: err.message }))
    proc.on('close', (code) => {
      if (code === 0) {
        try {
          resolve({ success: true, outputPath, size: fs.statSync(outputPath).size })
        } catch {
          resolve({ success: false, error: 'Output file was not created' })
        }
      } else {
        resolve({ success: false, error: stderr.trim().slice(-2000) })
      }
    })
  })
})

ipcMain.handle('app:save-text-file', async (_event, payload: {
  defaultFileName: string
  content: string
  extension: string
}) => {
  // The renderer never supplies the destination path — the user picks it in the
  // native dialog, so a compromised renderer cannot choose where text lands.
  const options: Electron.SaveDialogOptions = {
    title: 'Export',
    defaultPath: payload.defaultFileName,
    filters: [{ name: payload.extension.toUpperCase(), extensions: [payload.extension] }],
  }
  const saved = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options)
  if (saved.canceled || !saved.filePath) return { canceled: true }

  try {
    fs.writeFileSync(saved.filePath, payload.content, 'utf8')
    return {
      success: true,
      outputPath: saved.filePath,
      size: Buffer.byteLength(payload.content, 'utf8'),
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
})
