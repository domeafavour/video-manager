import {
  Dialog,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  VmButton,
  VmChip,
  VmDialogContent,
  VmEmptyState,
  VmInput,
  VmTitle,
} from "@/components/ui/vm";
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
      <VmDialogContent className="rounded-[28px]">
        <DialogHeader>
          <VmTitle as="h2" className="text-[24px]">
            Edit Tags
          </VmTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <VmInput
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
                <ul className="absolute z-10 mt-2 max-h-40 w-full overflow-y-auto rounded-2xl border border-[rgba(214,174,102,0.16)] bg-[rgba(17,19,23,0.98)] p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="cursor-pointer rounded-xl px-3 py-2 text-sm text-[#cfc5b5] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5dec0]"
                      onMouseDown={() => handleAddTag(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex min-h-25 flex-wrap items-start gap-2 rounded-2xl border border-[rgba(214,174,102,0.12)] bg-[rgba(19,21,26,0.72)] p-3">
            {tags.length === 0 && (
              <VmEmptyState className="flex min-h-19 w-full flex-col items-center justify-center rounded-xl border-[rgba(214,174,102,0.12)] bg-[rgba(255,255,255,0.02)] px-3 py-0">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8578]">
                  Tags
                </span>
                <span className="mt-1 text-sm italic text-[#756d60]">
                  No tags yet
                </span>
              </VmEmptyState>
            )}
            {tags.map((tag, index) => (
              editingIndex === index ? (
                <VmInput
                  key={index}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleEditKeyDown}
                  autoFocus
                  className="h-8 w-24 bg-[rgba(255,255,255,0.05)] px-2 py-1 text-sm"
                />
              ) : (
                <VmChip
                  key={tag}
                  className="group flex cursor-pointer items-center gap-1 px-3 py-1.5 text-sm transition-colors hover:border-[rgba(214,174,102,0.32)] hover:bg-[rgba(214,174,102,0.16)]"
                  onClick={() => startEditing(index)}
                >
                  <span>{tag}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag);
                    }}
                    className="text-[#9d937f] transition-colors hover:text-[#ffb3b3]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </VmChip>
              )
            ))}
          </div>
        </div>
        <DialogFooter>
          <VmButton tone="muted" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </VmButton>
          <VmButton onClick={handleSave} disabled={isPending}>
            Save
          </VmButton>
        </DialogFooter>
      </VmDialogContent>
    </Dialog>
  );
}
