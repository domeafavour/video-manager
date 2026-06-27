import { dragState } from "@/lib/drag-state";
import { cn } from "@/lib/utils";
import { resources } from "@/services/resources";
import { PropsWithChildren, useEffect, useState } from "react";
import { toast } from "sonner";

interface Props extends PropsWithChildren {
  className?: string;
  projectId: string | number;
}

export type DropFilesToAddProps = Props;

export function DropFilesToAdd({ children, className, projectId }: Props) {
  const { mutate: addResources } = resources.save.useMutation({
    onSuccess: () => {
      toast.success("Resources added");
    },
    onError: () => {
      toast.error("Failed to add resources");
    },
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleGlobalDragEnd = () => {
      dragState.isInternal = false;
      setIsDragging(false);
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
        isDragging && "bg-primary/[0.03] outline-2 outline-dashed outline-primary/50",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-lg text-primary font-semibold bg-card/90 backdrop-blur-sm border border-border px-4 py-2 rounded-md">
            Drop files to add
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
