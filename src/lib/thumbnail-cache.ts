import { DBSchema, IDBPDatabase, openDB } from "idb";
import { isImage, isVideo } from "@/utils/file-type";

interface ThumbnailDB extends DBSchema {
  thumbnails: {
    key: string;
    value: { path: string; dataUrl: string };
  };
}

const DB_NAME = "video-manager-thumbnails";

let dbPromise: Promise<IDBPDatabase<ThumbnailDB>>;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ThumbnailDB>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("thumbnails")) {
          db.createObjectStore("thumbnails", { keyPath: "path" });
        }
      },
    });
  }
  return dbPromise;
}

async function getThumbnail(path: string): Promise<string | null> {
  const db = await getDB();
  const entry = await db.get("thumbnails", path);
  return entry?.dataUrl ?? null;
}

async function setThumbnail(path: string, dataUrl: string): Promise<void> {
  const db = await getDB();
  await db.put("thumbnails", { path, dataUrl });
}

function generateImageThumbnail(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 300;
      const scale = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = `file://${path}`;
  });
}

function generateVideoThumbnail(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = `file://${path}#t=0.1`;
    video.preload = "metadata";
    video.muted = true;
    video.addEventListener("loadeddata", () => {
      const MAX = 300;
      const scale = Math.min(MAX / video.videoWidth, MAX / video.videoHeight, 1);
      const w = Math.round(video.videoWidth * scale);
      const h = Math.round(video.videoHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(video, 0, 0, w, h);
      video.remove();
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    });
    video.addEventListener("error", () => {
      video.remove();
      reject(new Error(`Failed to load video: ${path}`));
    });
    video.load();
  });
}

// ponytail: in-memory LRU — avoids IndexedDB reads for recently-used thumbnails
const lru = new Map<string, string>();
const LRU_MAX = 30;

function lruGet(path: string): string | undefined {
  const value = lru.get(path);
  if (value !== undefined) {
    lru.delete(path);
    lru.set(path, value);
  }
  return value;
}

function lruSet(path: string, dataUrl: string) {
  if (lru.has(path)) lru.delete(path);
  lru.set(path, dataUrl);
  if (lru.size > LRU_MAX) {
    const oldest = lru.keys().next().value!;
    lru.delete(oldest);
  }
}

export async function getOrCreateThumbnail(path: string): Promise<string> {
  const inMemory = lruGet(path);
  if (inMemory) return inMemory;

  const cached = await getThumbnail(path);
  if (cached) {
    lruSet(path, cached);
    return cached;
  }

  let dataUrl: string;
  if (isImage(path)) {
    dataUrl = await generateImageThumbnail(path);
  } else if (isVideo(path)) {
    dataUrl = await generateVideoThumbnail(path);
  } else {
    throw new Error("Unsupported file type");
  }

  lruSet(path, dataUrl);
  await setThumbnail(path, dataUrl);
  return dataUrl;
}
