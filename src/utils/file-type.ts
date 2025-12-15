export function isImage(path: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path);
}

export function isVideo(path: string) {
  return /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(path);
}
