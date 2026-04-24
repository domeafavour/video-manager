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
        isDragging && "ring-2 ring-[rgba(214,174,102,0.45)] ring-inset",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-[rgba(214,174,102,0.05)] backdrop-blur-[1px]">
          <div className="rounded-2xl border border-[rgba(214,174,102,0.22)] bg-[rgba(17,19,23,0.94)] px-5 py-3 text-lg font-semibold text-[#f1d6a0] shadow-[0_18px_40px_rgba(0,0,0,0.28)] [font-family:&quot;Playfair Display&quot;,serif]">
            Drop files here
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
