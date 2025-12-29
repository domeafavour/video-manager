import { db } from "@/lib/db";
import { router } from "react-query-kit";

export const resources = router("resources", {
  list: router.query({
    meta: {
      tags: ["Resources"],
    },
    fetcher: (id: number | string) => db.getProjectMaterials(Number(id)),
  }),
  save: router.mutation({
    meta: {
      invalidatesTags: ["Resources"],
    },
    mutationFn: async (variables: {
      files: File[];
      projectId: number | string;
    }) => {
      for (const file of variables.files) {
        await db.saveMaterial({
          projectId: +variables.projectId,
          name: file.name,
          path: file.path,
          size: file.size,
        });
      }
    },
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
  updateStatus: router.mutation({
    meta: {
      invalidatesTags: ["Resources"],
    },
    mutationFn: async (variables: { id: number | string; status: 'used' | 'unused' }) => {
      const existingMaterial = await db.getMaterial(+variables.id);
      if (!existingMaterial) {
        throw new Error('Material not found');
      }
      const material = await db.saveMaterial({ ...existingMaterial, status: variables.status });
      return material;
    },
  }),
});
