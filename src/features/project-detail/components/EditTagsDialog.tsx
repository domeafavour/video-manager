import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { resources } from "@/services/resources";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: number;
  initialTags: string[];
  allProjectTags?: string[];
}

export function EditTagsDialog({
  open,
  onOpenChange,
  resourceId,
  initialTags,
  allProjectTags = [],
}: Props) {
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [inputValue, setInputValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const SUGGESTIONS_CLOSE_DELAY = 150;

  const { mutate: updateTags, isPending } = resources.updateTags.useMutation({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (open) {
      setTags(initialTags || []);
      setInputValue("");
      setEditingIndex(null);
      setEditValue("");
      setShowSuggestions(false);
    }
  }, [open, initialTags]);

  const suggestions = allProjectTags.filter(
    (t) =>
      t.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(t),
  );

  const handleAddTag = (value?: string) => {
    const trimmed = (value ?? inputValue).trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(tags[index]);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editValue.trim();
    
    // If empty remove the tag
    if (!trimmed) {
        handleRemoveTag(tags[editingIndex]);
        setEditingIndex(null);
        return;
    }

    // Check for uniqueness excluding current index
    const isDuplicate = tags.some((t, i) => i !== editingIndex && t === trimmed);
    
    if (!isDuplicate) {
      const newTags = [...tags];
      newTags[editingIndex] = trimmed;
      setTags(newTags);
    }
    
    setEditingIndex(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  const handleSave = () => {
    updateTags({ id: resourceId, tags });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), SUGGESTIONS_CLOSE_DELAY)}
                placeholder="Add a tag..."
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-md max-h-40 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-accent"
                      onMouseDown={() => handleAddTag(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-2 min-h-[100px] border rounded-md p-2 bg-slate-50">
            {tags.length === 0 && (
              <span className="text-gray-400 text-sm italic p-1">No tags</span>
            )}
            {tags.map((tag, index) => (
              editingIndex === index ? (
                <Input
                  key={index}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleEditKeyDown}
                  autoFocus
                  className="h-7 w-24 text-sm px-2 py-1"
                />
              ) : (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-white border px-2 py-1 rounded text-sm group cursor-pointer hover:border-blue-300"
                  onClick={() => startEditing(index)}
                >
                  <span>{tag}</span>
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
              )
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
