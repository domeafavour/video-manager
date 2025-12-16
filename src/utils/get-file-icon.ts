import {
  FileArchive,
  FileAudio,
  FileCode,
  File as FileIcon,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

export function getFileIcon(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp3":
    case "wav":
    case "ogg":
    case "flac":
    case "m4a":
      return FileAudio;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return FileArchive;
    case "js":
    case "ts":
    case "tsx":
    case "jsx":
    case "html":
    case "css":
    case "py":
    case "java":
    case "c":
    case "cpp":
      return FileCode;
    case "json":
      return FileJson;
    case "txt":
    case "md":
    case "doc":
    case "docx":
    case "pdf":
      return FileText;
    case "xls":
    case "xlsx":
    case "csv":
      return FileSpreadsheet;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
    case "bmp":
      return FileImage;
    default:
      return FileIcon;
  }
}
