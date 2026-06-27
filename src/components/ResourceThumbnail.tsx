import { useThumbnail } from "@/hooks/useThumbnail";
import { cn } from "@/lib/utils";
import { isImage, isVideo } from "@/utils/file-type";
import { getFileIcon } from "@/utils/get-file-icon";
import { FileImage, FileVideo } from "lucide-react";
import { PropsWithChildren } from "react";

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
        "w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0 border border-border relative",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ResourceThumbnail({ path, className }: Props) {
  const { thumbnail, isLoading } = useThumbnail(path);

  // ponytail: render cached thumbnail when available
  if (thumbnail) {
    return (
      <IconShape className={className}>
        <img
          src={thumbnail}
          alt="thumbnail"
          className="w-full h-full object-cover"
        />
      </IconShape>
    );
  }

  // ponytail: show skeleton while generating, then fallback on error
  if (isLoading && (isImage(path) || isVideo(path))) {
    return (
      <IconShape className={className}>
        <div className="w-full h-full animate-pulse bg-muted-foreground/10" />
      </IconShape>
    );
  }

  if (isImage(path)) {
    return (
      <IconShape className={className}>
        <FileImage className="w-6 h-6 text-muted-foreground" />
      </IconShape>
    );
  }

  if (isVideo(path)) {
    return (
      <IconShape className={className}>
        <FileVideo className="w-6 h-6 text-muted-foreground" />
      </IconShape>
    );
  }

  const Icon = getFileIcon(path);

  return (
    <IconShape className={className}>
      <Icon className="w-6 h-6 text-muted-foreground" />
    </IconShape>
  );
}
