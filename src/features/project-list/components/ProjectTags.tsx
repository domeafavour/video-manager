import { cn } from "@/lib/utils";
import { isTimeTag } from "@/utils/time-tag";
import { useMemo } from "react";
import { HighlightText } from "./HighlightText";

interface Props {
  tags?: string[];
  query?: string;
}

export type ProjectTagsProps = Props;

export function ProjectTags({ tags, query }: Props) {
  const trimmedQuery = query?.trim() ?? "";
  const displayTags = useMemo(() => {
    return trimmedQuery
      ? tags?.filter((tag) =>
          tag.toLowerCase().includes(trimmedQuery.toLowerCase().trim()),
        )
      : tags;
  }, [tags, trimmedQuery]);

  const visibleTags = displayTags?.slice(0, 4);
  const overflowCount = displayTags ? displayTags.length - 4 : 0;

  return visibleTags?.length ? (
    <div className="flex flex-wrap gap-1 mt-1">
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-sm",
            isTimeTag(tag)
              ? "bg-chart-3/20 text-chart-3"
              : "bg-primary/15 text-primary",
          )}
        >
          <HighlightText text={tag} query={trimmedQuery} />
        </span>
      ))}
      {overflowCount > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded-sm">
          +{overflowCount}
        </span>
      )}
    </div>
  ) : null;
}
