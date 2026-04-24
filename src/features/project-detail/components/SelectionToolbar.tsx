import { VmButton } from "@/components/ui/vm";
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
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[rgba(214,174,102,0.18)] bg-[rgba(17,19,23,0.9)] px-1.5 py-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <button
          type="button"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className={cn(
            "inline-flex h-9 min-w-12 cursor-grab flex-row items-center gap-1.5 rounded-full border border-[rgba(214,174,102,0.28)] bg-[rgba(214,174,102,0.16)] px-3.5 py-1 text-sm font-semibold text-[#f1d6a0] active:cursor-grabbing",
          )}
          title="Drag selected resources"
        >
          <GripVertical className="size-4 text-[#b39c79]" />
          {selectedResourceCount} Resource
          {selectedResourceCount > 1 ? "s" : ""}
        </button>
        <VmButton
          tone="muted"
          type="button"
          size="icon-sm"
          onClick={onClear}
          title="Clear selected resources"
          className="h-9 w-9 rounded-full border-transparent text-[#b39c79] hover:border-[rgba(214,174,102,0.14)] hover:text-[#f1d6a0]"
        >
          <XIcon className="size-4" />
        </VmButton>
      </div>
    </div>
  );
}
