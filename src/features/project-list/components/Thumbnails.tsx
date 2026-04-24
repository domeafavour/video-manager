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
      className="grid aspect-3/2 w-full grid-cols-3 grid-rows-2 gap-px overflow-hidden rounded-sm bg-[rgba(214,174,102,0.14)]"
    >
      {SLOT_INDICES.map((index) => {
        const item = data?.[index];
        return item ? (
          <ResourceThumbnail
            className="h-full w-full rounded-none border-0 bg-[#d7d8dd]"
            path={item.path}
            key={item.id + "_" + index}
          />
        ) : (
          <div
            key={index}
            className="h-full w-full bg-[#d7d8dd]"
          />
        );
      })}
    </div>
  );
});
