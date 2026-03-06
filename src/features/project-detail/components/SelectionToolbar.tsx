import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GripVertical, XIcon } from "lucide-react";

export interface SelectionToolbarProps {
  selectedResourceCount: number;
  onDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
  onClear: () => void;
}

export function SelectionToolbar({
  selectedResourceCount,
  onDragStart,
  onDragEnd,
  onClear,
}: SelectionToolbarProps) {
  if (selectedResourceCount === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50 pointer-events-none">
      <div className="inline-flex items-center gap-2 rounded-full border bg-background/95 px-1 py-1 shadow-lg backdrop-blur-sm pointer-events-auto">
        <button
          type="button"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className={cn(
            "inline-flex flex-row items-center gap-1",
            "min-w-12 h-8 px-3 py-1 text-sm rounded-full border border-blue-500 bg-blue-50 text-blue-700 font-semibold cursor-grab active:cursor-grabbing",
          )}
          title="Drag selected resources"
        >
          <GripVertical className="size-4 text-muted-foreground" />
          {selectedResourceCount} Resource
          {selectedResourceCount > 1 ? "s" : ""}
        </button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClear}
          title="Clear selected resources"
          className="h-8 w-8 rounded-full"
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
