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
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { VmButton, VmIconBadge, VmNavChip, VmTitle } from "./ui/vm";

function OpenedProjects() {
  const navigate = useNavigate();
  const routerState = useRouterState();
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
        const isActive = routerState.location.pathname === `/projects/${openedId}`;
        return (
          <SidebarMenuItem key={openedId}>
            <SidebarMenuButton asChild className="max-w-full rounded-2xl border border-transparent transition-all hover:border-[rgba(214,174,102,0.12)] hover:bg-[rgba(255,255,255,0.03)]">
              <Link
                to="/projects/$id"
                params={{ id: openedId }}
                className='flex flex-1 [font-family:"DM Sans",system-ui,sans-serif]'
              >
                <VmNavChip
                  active={isActive}
                  className="w-full rounded-2xl px-3 py-2 font-medium"
                >
                  <span className="truncate">{p.title}</span>
                  <Button
                    size={"icon-sm"}
                    variant={"link"}
                    className="ms-auto rounded-full text-[#8d8578] hover:text-[#f1d6a0]"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      deleteOpenedId(openedId);
                      navigate({
                        to: "/",
                      });
                    }}
                  >
                    <X />
                  </Button>
                </VmNavChip>
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
                <VmIconBadge className="size-8">
                  <Video className="size-4" />
                </VmIconBadge>
                <div className="flex flex-col gap-0.5 leading-none">
                  <VmTitle as="span" className="font-medium">Video Manager</VmTitle>
                  <span className="text-[#8d8578]">v0.1.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <VmButton
          tone="muted"
          variant="outline"
          onClick={() => {
            addProject();
          }}
        >
          <Plus />
        </VmButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <OpenedProjects />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
