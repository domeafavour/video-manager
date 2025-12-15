import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: () => {
    throw redirect({ to: "/projects" });
  },
});

function Index() {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
        Welcome Home
      </div>
    </div>
  );
}
