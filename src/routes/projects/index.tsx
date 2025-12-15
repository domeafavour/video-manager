import { ProjectList } from "@/features/project-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/")({
  component: ProjectList,
});
