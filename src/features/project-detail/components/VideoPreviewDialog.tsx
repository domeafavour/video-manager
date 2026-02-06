import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { resources } from "@/services/resources";
import { isTimeTag, parseTimeFromTag, createTimeTag } from "@/utils/time-tag";
import { X, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
  const videoRef = useRef<HTMLVideoElement>(null);
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

    const video = videoRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
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
    if (time !== null && videoRef.current) {
      videoRef.current.currentTime = time;
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
      <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Video Preview</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/5 rounded-md">
          <video
            ref={videoRef}
            src={`file://${resourcePath}`}
            controls
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="space-y-3 pt-3 border-t">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add note at current time..."
              className="flex-1"
            />
            <Button onClick={handleAddTimeTag} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Tag
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-md border">
              {tags.map((tag) => {
                const isTime = isTimeTag(tag);
                return (
                  <div
                    key={tag}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-sm group border",
                      isTime
                        ? "bg-purple-50 text-purple-700 border-purple-200 cursor-pointer hover:bg-purple-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    )}
                    onClick={() => handleTagClick(tag)}
                  >
                    <span className={isTime ? "font-mono" : ""}>{tag}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
