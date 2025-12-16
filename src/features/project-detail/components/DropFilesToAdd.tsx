import { dragState } from "@/lib/drag-state";
import { cn } from "@/lib/utils";
import { resources } from "@/services/resources";
import { PropsWithChildren, useEffect, useState } from "react";

interface Props extends PropsWithChildren {
  className?: string;
  projectId: string | number;
}

export type DropFilesToAddProps = Props;

export function DropFilesToAdd({ children, className, projectId }: Props) {
  const { mutate: addResources } = resources.save.useMutation();
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
    addResources({
      files,
      projectId,
    });
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
        "h-full transition-colors relative rounded",
        isDragging && "bg-blue-50 outline-2 outline-dashed outline-blue-400",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-2xl text-blue-600 font-semibold bg-white bg-opacity-75 p-4 rounded-lg">
            Drop files to add
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
