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
        isDragging && "ring-4 ring-blue-400 ring-inset",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-blue-50 bg-opacity-90">
          <div className="text-lg text-blue-600 font-semibold bg-white p-3 rounded-lg shadow-lg">
            Drop files here
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
