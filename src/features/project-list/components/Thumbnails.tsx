import { ResourceThumbnail } from "@/components/ResourceThumbnail";
import { resources } from "@/services/resources";
import { memo, useEffect, useRef, useState } from "react";

interface Props {
  projectId: string | number;
}

export type ThumbnailsProps = Props;

const PREVIEW_SLOT_COUNT = 6;
const SLOT_INDICES = Array.from(
  { length: PREVIEW_SLOT_COUNT },
  (_, index) => index,
);

export const Thumbnails = memo(function Thumbnails({ projectId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldLoad]);

  const { data } = resources.list.useQuery({
    variables: projectId,
    enabled: shouldLoad,
    select: (items) => items.slice(0, PREVIEW_SLOT_COUNT),
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 grid grid-cols-3 grid-rows-2 rounded-sm overflow-hidden"
    >
      {SLOT_INDICES.map((index) => {
        const item = data?.[index];
        return item ? (
          <ResourceThumbnail
            className="h-full w-full rounded-none"
            path={item.path}
            key={item.id + "_" + index}
          />
        ) : (
          <div
            key={index}
            className="w-full h-full bg-gray-100 border border-gray-200"
          />
        );
      })}
    </div>
  );
});
