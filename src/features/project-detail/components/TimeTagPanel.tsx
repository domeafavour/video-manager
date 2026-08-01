import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resources } from "@/services/resources";
import { createTimeTag, isTimeTag, parseTimeFromTag } from "@/utils/time-tag";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  resourceId: number;
  initialTags: string[];
  open: boolean;
  getCurrentTime: () => number | null;
  seekTo: (time: number) => void;
}

export function TimeTagPanel({
  resourceId,
  initialTags,
  open,
  getCurrentTime,
  seekTo,
}: Props) {
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
    const currentTime = getCurrentTime();
    if (!trimmed || currentTime === null) return;

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
    if (time !== null) seekTo(time);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTimeTag();
    }
  };

  return (
    <>
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
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-muted/30 rounded-md border border-border">
          {tags.map((tag) => {
            const isTime = isTimeTag(tag);
            return (
              <div
                key={tag}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-sm text-sm group border border-border",
                  isTime
                    ? "bg-chart-3/20 text-chart-3 cursor-pointer hover:bg-chart-3/30"
                    : "bg-primary/15 text-primary"
                )}
                onClick={() => handleTagClick(tag)}
              >
                <span className={isTime ? "font-mono" : ""}>{tag}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
