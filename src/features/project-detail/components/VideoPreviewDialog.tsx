import {
  Dialog,
  DialogHeader,
} from "@/components/ui/dialog";
import { VmButton, VmChip, VmDialogContent, VmInput, VmTitle } from "@/components/ui/vm";
import { resources } from "@/services/resources";
import { isTimeTag, parseTimeFromTag, createTimeTag } from "@/utils/time-tag";
import { X, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ReactPlayer from "react-player";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: number;
  resourcePath: string;
  initialTags: string[];
}

export function VideoPreviewDialog({
  open,
  onOpenChange,
  resourceId,
  resourcePath,
  initialTags,
}: Props) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [tagInput, setTagInput] = useState("");

  const { mutate: updateTags } = resources.updateTags.useMutation({
    onSuccess: () => {
      // Tags updated successfully
    },
  });

  useEffect(() => {
    if (open) {
      setTags(initialTags || []);
      setTagInput("");
    }
  }, [open, initialTags]);

  const handleAddTimeTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    const player = playerRef.current;
    if (!player) return;

    const currentTime = player.currentTime;
    const timeTag = createTimeTag(currentTime, trimmed);

    if (!tags.includes(timeTag)) {
      const newTags = [...tags, timeTag];
      setTags(newTags);
      updateTags({ id: resourceId, tags: newTags });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    updateTags({ id: resourceId, tags: newTags });
  };

  const handleTagClick = (tag: string) => {
    if (!isTimeTag(tag)) return;

    const time = parseTimeFromTag(tag);
    if (time !== null && playerRef.current) {
      playerRef.current.currentTime = time;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTimeTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <VmDialogContent className="flex h-[85vh] w-full max-w-4xl flex-col rounded-[28px]">
        <DialogHeader>
          <VmTitle as="h2" className="text-[24px]">
            Video Preview
          </VmTitle>
        </DialogHeader>
        <div className="flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-[rgba(214,174,102,0.12)] bg-[rgba(0,0,0,0.22)]">
          <ReactPlayer
            ref={playerRef}
            src={`file://${resourcePath}`}
            controls
            width="100%"
            height="100%"
            style={{ maxHeight: "100%" }}
          />
        </div>
        <div className="space-y-3 border-t border-[rgba(214,174,102,0.12)] pt-4">
          <div className="flex gap-2">
            <VmInput
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add note at current time..."
              className="flex-1"
            />
            <VmButton onClick={handleAddTimeTag} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Tag
            </VmButton>
          </div>
          {tags.length > 0 && (
            <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-[rgba(214,174,102,0.12)] bg-[rgba(19,21,26,0.72)] p-3">
              {tags.map((tag) => {
                const isTime = isTimeTag(tag);
                return (
                  <VmChip
                    key={tag}
                    className={cn(
                      "group flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      isTime
                        ? "cursor-pointer border-[rgba(196,181,253,0.18)] bg-[rgba(124,58,237,0.14)] text-[#d7c8ff] hover:bg-[rgba(124,58,237,0.2)]"
                        : "border-[rgba(214,174,102,0.18)] bg-[rgba(214,174,102,0.1)] text-[#d6b277]",
                    )}
                    onClick={() => handleTagClick(tag)}
                  >
                    <span className={isTime ? "font-mono" : ""}>{tag}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag);
                      }}
                      className="text-[#9d937f] transition-colors hover:text-[#ffb3b3]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </VmChip>
                );
              })}
            </div>
          )}
        </div>
      </VmDialogContent>
    </Dialog>
  );
}
