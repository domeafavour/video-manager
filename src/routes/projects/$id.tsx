import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <div>Hello "/projects/{id}"!</div>;
}
