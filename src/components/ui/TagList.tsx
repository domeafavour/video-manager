import { cn } from "@/lib/utils";
import { isTimeTag } from "@/utils/time-tag";
import { HighlightText } from "./HighlightText";

interface TagListProps {
  tags: string[];
  max?: number;
  query?: string;
  className?: string;
}

export function TagList({ tags, max = 4, query, className }: TagListProps) {
  const visibleTags = max ? tags.slice(0, max) : tags;
  const overflow = max ? Math.max(0, tags.length - max) : 0;

  if (visibleTags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-md",
            isTimeTag(tag)
              ? "bg-chart-3/20 text-chart-3"
              : "bg-primary/15 text-primary",
          )}
        >
          {query ? <HighlightText text={tag} query={query} /> : tag}
        </span>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
}
