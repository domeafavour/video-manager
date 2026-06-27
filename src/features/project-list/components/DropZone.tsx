import { dragState } from "@/lib/drag-state";
import { cn } from "@/lib/utils";
import { PropsWithChildren, useEffect, useState } from "react";

interface Props extends PropsWithChildren {
  className?: string;
  onDrop: (files: File[]) => void;
}

export type DropZoneProps = Props;

export function DropZone({ children, className, onDrop }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleGlobalDragEnd = () => {
      dragState.isInternal = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons === 0) {
        dragState.isInternal = false;
      }
    };
    window.addEventListener("dragend", handleGlobalDragEnd);
    window.addEventListener("mouseup", handleGlobalDragEnd);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("dragend", handleGlobalDragEnd);
      window.removeEventListener("mouseup", handleGlobalDragEnd);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (dragState.isInternal) {
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onDrop(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragState.isInternal) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "h-full transition-colors relative",
        isDragging && "ring-2 ring-primary ring-inset rounded-lg",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-sm text-primary font-semibold bg-card border border-border px-4 py-2 rounded-md shadow-sm">
            Drop files here
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
