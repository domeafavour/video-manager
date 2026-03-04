interface Props {
  tags?: string[];
}

export type ProjectTagsProps = Props;

export function ProjectTags({ tags }: Props) {
  return tags?.length ? (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 rounded"
        >
          {tag}
        </span>
      ))}
    </div>
  ) : null;
}
