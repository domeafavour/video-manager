import { ProjectDetail } from "@/features/project-detail";
import { addOpenedId } from "@/stores/opened-projects";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/$id")({
  component: RouteComponent,
  beforeLoad: (ctx) => {
    addOpenedId(ctx.params.id);
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <ProjectDetail id={id} />;
}
