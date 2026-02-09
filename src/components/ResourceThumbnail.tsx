import { cn } from "@/lib/utils";
import { isImage, isVideo } from "@/utils/file-type";
import { getFileIcon } from "@/utils/get-file-icon";
import { FileImage, FileVideo } from "lucide-react";
import { PropsWithChildren, useState } from "react";

interface Props {
  path: string;
  className?: string;
}

export type ResourceThumbnailProps = Props;

function IconShape({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "w-12 h-12 rounded bg-gray-100 flex items-center justify-center shrink-0 border relative",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ResourceThumbnail({ path, className }: Props) {
  const [error, setError] = useState(false);

  if (isImage(path)) {
    if (error) {
      return (
        <IconShape className={className}>
          <FileImage className="w-6 h-6 text-gray-400" />
        </IconShape>
      );
    }
    return (
      <IconShape className={className}>
        <img
          src={`file://${path}`}
          alt="thumbnail"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setError(true)}
        />
      </IconShape>
    );
  }

  if (isVideo(path)) {
    if (error) {
      return (
        <IconShape className={className}>
          <FileVideo className="w-6 h-6 text-gray-400" />
        </IconShape>
      );
    }
    return (
      <IconShape className={className}>
        <video
          src={`file://${path}#t=0.1`}
          className="w-full h-full object-cover"
          preload="metadata"
          onError={() => setError(true)}
        />
      </IconShape>
    );
  }

  const Icon = getFileIcon(path);

  return (
    <IconShape className={className}>
      <Icon className="w-6 h-6 text-gray-400" />
    </IconShape>
  );
}
