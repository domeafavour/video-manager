import { useEffect, useState } from "react";
import { getOrCreateThumbnail } from "@/lib/thumbnail-cache";

export function useThumbnail(path: string) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const dataUrl = await getOrCreateThumbnail(path);
        if (!cancelled) setThumbnail(dataUrl);
      } catch {
        // keep thumbnail as null — caller shows fallback
      }
      if (!cancelled) setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { thumbnail, isLoading };
}
