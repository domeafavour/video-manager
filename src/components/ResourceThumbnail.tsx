import { isImage, isVideo } from "@/utils/file-type";
import {
  FileArchive,
  FileAudio,
  FileCode,
  File as FileIcon,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";
import { useState } from "react";

interface Props {
  path: string;
}

export type ResourceThumbnailProps = Props;

export function ResourceThumbnail({ path }: Props) {
  const [error, setError] = useState(false);

  const getFileIcon = (path: string) => {
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
  };

  if (isImage(path)) {
    if (error) {
      return (
        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center shrink-0 border">
          <FileImage className="w-6 h-6 text-gray-400" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 shrink-0 border">
        <img
          src={`file://${path}`}
          alt="thumbnail"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  if (isVideo(path)) {
    if (error) {
      return (
        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center shrink-0 border">
          <FileVideo className="w-6 h-6 text-gray-400" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 shrink-0 border relative">
        <video
          src={`file://${path}#t=0.1`}
          className="w-full h-full object-cover"
          preload="metadata"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  const Icon = getFileIcon(path);

  return (
    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center shrink-0 border">
      <Icon className="w-6 h-6 text-gray-400" />
    </div>
  );
}
