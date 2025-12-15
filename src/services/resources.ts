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
  create: router.mutation({
    mutationFn: (variables: Partial<import("@/typings").MaterialEntity>) => {
      return db.saveMaterial(variables);
    },
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
