import { ResourceThumbnail } from "@/components/ResourceThumbnail";
import { resources } from "@/services/resources";

interface Props {
  projectId: string | number;
}

export type ThumbnailsProps = Props;

export function Thumbnails({ projectId }: Props) {
  const { data } = resources.list.useQuery({ variables: projectId });

  if (!data) {
    return null;
  }

  return (
    <div className="flex-1 grid grid-cols-3 grid-rows-2 rounded-sm overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => {
        const item = data[i];
        return item ? (
          <ResourceThumbnail
            className="h-full w-full rounded-none"
            path={item.path}
            key={item.id + "_" + i}
          />
        ) : (
          <div
            key={i}
            className="w-full h-full bg-gray-100 border border-gray-200"
          />
        );
      })}
    </div>
  );
}
