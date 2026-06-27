import { projects } from "@/services/projects";

export function useProjectName(projectId: number): string {
  const { data } = projects.list.useQuery();
  if (!data) return `Project #${projectId}`;
  const project = data.find((p) => p.id === projectId);
  return project?.title ?? `Project #${projectId}`;
}
