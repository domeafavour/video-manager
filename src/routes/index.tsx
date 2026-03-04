import { ProjectList } from "@/features/project-list";
import { setActiveProjectId } from "@/stores/settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: ProjectList,
  beforeLoad: () => {
    setActiveProjectId(null);
  },
});
