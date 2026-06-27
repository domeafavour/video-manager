import { AppSidebar } from "@/components/app-sidebar";
import { AppTabs } from "@/components/app-tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: () => (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex flex-col flex-1 h-screen bg-background overflow-hidden">
        <AppTabs />
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.12 0.01 70)",
            color: "oklch(0.98 0.003 70)",
            border: "1px solid oklch(0.2 0.01 70)",
            borderRadius: "0.375rem",
          },
        }}
      />
      {/* hide devtools in production */}
      {process.env.NODE_ENV !== "production" && <TanStackRouterDevtools />}
    </SidebarProvider>
  ),
});
