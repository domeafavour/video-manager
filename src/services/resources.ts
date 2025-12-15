import { db } from "@/lib/db";
import { router } from "react-query-kit";

export const resources = router("resources", {
  list: router.query({
    meta: {
      tags: ["Resources"],
    },
    fetcher: (id: number | string) => db.getProjectMaterials(Number(id)),
  }),
  add: router.mutation({
    mutationFn: (variables: { projectId: number | string }) =>
      db.addMaterialDialog(+variables.projectId),
    meta: {
      invalidatesTags: ["Resources"],
    },
  }),
  delete: router.mutation({
    meta: {
      invalidatesTags: ["Resources"],
    },
    mutationFn: (variables: { id: number | string }) =>
      db.deleteMaterial(+variables.id),
  }),
});
