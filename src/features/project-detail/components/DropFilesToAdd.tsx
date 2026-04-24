import { VmEyebrow, VmTitle } from "@/components/ui/vm";
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
        "relative h-full rounded-[30px] transition-all duration-200",
        isDragging &&
          "bg-[rgba(214,174,102,0.05)] outline-2 outline-dashed outline-[rgba(214,174,102,0.45)] outline-offset-[-10px]",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-[30px] bg-[rgba(8,9,12,0.42)] backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-[rgba(214,174,102,0.22)] bg-[rgba(17,19,23,0.92)] px-8 py-6 text-center shadow-[0_24px_50px_rgba(0,0,0,0.3)]">
            <VmEyebrow className="text-[#8d8578]">
              Add Resources
            </VmEyebrow>
            <VmTitle className="text-[28px] font-semibold leading-none text-[#f1d6a0]">
              Drop files here
            </VmTitle>
            <div className="text-sm text-[#b8ae9c]">
              They will be added to this project immediately.
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
