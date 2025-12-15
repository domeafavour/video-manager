import { db } from "@/lib/db";
import { ProjectEntity } from "@/typings";
import { router } from "react-query-kit";

export const projects = router("projects", {
  list: router.query({
    meta: {
      tags: ["Projects"],
    },
    fetcher: () => db.getProjects(),
  }),
  byId: router.query({
    meta: {
      tags: ["ProjectById"],
    },
    fetcher: (variables: { id: number | string }) =>
      db.getProject(+variables.id),
  }),
  save: router.mutation({
    meta: {
      invalidatesTags: ["Projects"],
    },
    mutationFn: (variables: Partial<ProjectEntity>) =>
      db.saveProject(variables),
  }),
  update: router.mutation({
    meta: {
      invalidatesTags: ["Projects", "ProjectById"],
    },
    mutationFn: (variables: Partial<ProjectEntity>) =>
      db.saveProject(variables),
  }),
  delete: router.mutation({
    meta: {
      invalidatesTags: ["Projects"],
    },
    mutationFn: (variables: { id: string | number }) =>
      db.deleteProject(+variables.id),
  }),
});
