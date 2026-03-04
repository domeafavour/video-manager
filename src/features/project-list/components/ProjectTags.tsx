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

  return displayTags?.length ? (
    <div className="flex flex-wrap gap-1 mt-1">
      {displayTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 rounded"
        >
          <HighlightText text={tag} query={trimmedQuery} />
        </span>
      ))}
    </div>
  ) : null;
}
