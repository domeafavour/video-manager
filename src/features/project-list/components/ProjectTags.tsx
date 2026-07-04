import { TagList } from "@/components/ui/TagList";
import { useMemo } from "react";

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

  if (!displayTags?.length) return null;

  return <TagList tags={displayTags} query={trimmedQuery} />;
}
