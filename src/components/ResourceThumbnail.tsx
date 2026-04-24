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
        "relative flex h-12 w-12 shrink-0 items-center justify-center rounded border border-[rgba(214,174,102,0.14)] bg-[#d7d8dd] text-[#7b7468]",
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
          <FileImage className="h-6 w-6 text-[#8f887a]" />
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
          <FileVideo className="h-6 w-6 text-[#8f887a]" />
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
      <Icon className="h-6 w-6 text-[#8f887a]" />
    </IconShape>
  );
}
