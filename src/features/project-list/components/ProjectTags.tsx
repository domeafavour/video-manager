import { VmChip } from "@/components/ui/vm";
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
    <div className="flex flex-wrap content-start gap-1 mt-1 min-h-5">
      {displayTags.map((tag) => (
        <VmChip
          key={tag}
          className="rounded-md border-[rgba(214,174,102,0.2)] bg-[rgba(214,174,102,0.1)] px-2 py-px text-[10px] font-medium leading-tight text-[#c5a36a]"
        >
          <HighlightText text={tag} query={trimmedQuery} />
        </VmChip>
      ))}
    </div>
  ) : null;
}
