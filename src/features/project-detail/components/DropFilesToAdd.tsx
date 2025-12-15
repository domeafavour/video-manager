import { cn } from "@/lib/utils";
import { resources } from "@/services/resources";
import { PropsWithChildren, useState } from "react";

interface Props extends PropsWithChildren {
  className?: string;
  projectId: string | number;
}

export type DropFilesToAddProps = Props;

export function DropFilesToAdd({ children, className, projectId }: Props) {
  const { mutate: addResource } = resources.create.useMutation();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      addResource({
        projectId: Number(projectId),
        name: file.name,
        size: file.size,
        path: file.path,
      });
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "p-8 h-full transition-colors relative rounded",
        isDragging && "bg-blue-50 outline-2 outline-dashed outline-blue-400",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-2xl text-blue-600 font-semibold bg-white bg-opacity-75 p-4 rounded-lg">
            Drop files to add
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
