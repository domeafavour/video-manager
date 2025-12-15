import { GalleryVerticalEnd } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { projects } from "@/services/projects";
import { useOpenedIds } from "@/stores/opened-projects";
import { Link } from "@tanstack/react-router";

function OpenedProjects() {
  const openedIds = useOpenedIds();
  const { data } = projects.list.useQuery();

  if (!data) {
    return null;
  }

  const entities = Object.fromEntries(data.map((p) => [p.id, p]));

  return (
    <SidebarMenu className="gap-2">
      {openedIds.map((openedId) => {
        const p = entities[openedId];
        if (!p) {
          return null;
        }
        return (
          <SidebarMenuItem key={openedId}>
            <SidebarMenuButton asChild>
              <Link
                to="/projects/$id"
                params={{ id: openedId }}
                className="font-medium"
                activeProps={{
                  className: "bg-gray-200",
                }}
              >
                {p.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Documentation</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <OpenedProjects />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
