import { Plus, Video, X } from "lucide-react";
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
import { useAddProject } from "@/features/project-list/hooks/useAddProject";
import { projects } from "@/services/projects";
import { deleteOpenedId, useOpenedIds } from "@/stores/opened-projects";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";

function OpenedProjects() {
  const navigate = useNavigate();
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
            <SidebarMenuButton asChild className="max-w-full">
              <Link
                to="/projects/$id"
                params={{ id: openedId }}
                className="font-medium flex-1"
                activeProps={{
                  className: "bg-gray-200",
                }}
              >
                <span className="truncate">{p.title}</span>
                <Button
                  size={"icon-sm"}
                  variant={"link"}
                  className="ms-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    deleteOpenedId(openedId);
                    navigate({
                      to: "/projects",
                    });
                  }}
                >
                  <X />
                </Button>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [addProject] = useAddProject();
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Video className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Video Manager</span>
                  <span className="">v0.1.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Button
          variant={"outline"}
          onClick={() => {
            addProject();
          }}
        >
          <Plus />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <OpenedProjects />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
