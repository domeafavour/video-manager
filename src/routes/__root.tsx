import { AppTabs } from "@/components/app-tabs";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col h-screen bg-background">
      <AppTabs />
      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>
      {/* hide devtools in production */}
      {process.env.NODE_ENV !== "production" && <TanStackRouterDevtools />}
    </div>
  ),
});
