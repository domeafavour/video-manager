import { ProjectDetail } from "@/features/project-detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <ProjectDetail id={id} />;
}
