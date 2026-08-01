import { db } from "@/lib/db";
import { ClipEntity } from "@/typings";
import { router } from "react-query-kit";

export const clips = router("clips", {
  list: router.query({
    meta: {
      tags: ["Clips"],
    },
    fetcher: (materialId: number | string) =>
      db.getClipsByMaterial(Number(materialId)),
  }),
  save: router.mutation({
    meta: {
      invalidatesTags: ["Clips"],
    },
    mutationFn: (variables: Partial<ClipEntity>) => db.saveClip(variables),
  }),
  delete: router.mutation({
    meta: {
      invalidatesTags: ["Clips"],
    },
    mutationFn: async (variables: { id: number | string }) => {
      await db.deleteClip(+variables.id);
    },
  }),
});
