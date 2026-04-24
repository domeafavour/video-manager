import { useAddProject } from "@/features/project-list/hooks/useAddProject";
import { projects } from "@/services/projects";
import { deleteOpenedId, useOpenedIds } from "@/stores/opened-projects";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Plus, Video, X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { VmButton, VmIconBadge, VmNavChip, VmTitle } from "./ui/vm";

export function AppTabs() {
  const navigate = useNavigate();
  const openedIds = useOpenedIds();
  const { data } = projects.list.useQuery();
  const [addProject] = useAddProject();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const entities = data ? Object.fromEntries(data.map((p) => [p.id, p])) : {};

  return (
    <div className="flex items-center border-b border-[rgba(214,174,102,0.12)] bg-[linear-gradient(180deg,rgba(17,19,23,0.96)_0%,rgba(20,22,27,0.92)_100%)] text-[#ddd7cb] backdrop-blur-md">
      {/* App logo/title - fixed */}
      <Link to="/" className="shrink-0">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <VmIconBadge className="size-7 rounded-md">
            <Video className="size-4" />
          </VmIconBadge>
          <VmTitle as="span" className="hidden text-sm font-semibold sm:inline">
            Video Manager
          </VmTitle>
        </div>
      </Link>

      <div className="mx-1 h-6 w-px shrink-0 bg-[rgba(214,174,102,0.12)]" />

      {/* Scrollable tabs area */}
      <ScrollArea className="w-0 flex-1 py-2.5">
        <div className="flex flex-nowrap items-center gap-1.5 px-1.5">
          {/* Opened project tabs */}
          {openedIds.map((openedId) => {
            const p = entities[openedId];
            if (!p) return null;

            const isActive = currentPath === `/projects/${openedId}`;

            return (
              <VmNavChip
                key={openedId}
                active={isActive}
                className="group max-w-50 shrink-0 px-3 py-1.5 text-sm font-medium"
              >
                <Link
                  to="/projects/$id"
                  params={{ id: openedId }}
                  className="truncate"
                >
                  {p.title}
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-1 size-5 shrink-0 rounded-full text-[#8d8578] opacity-0 transition-all hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f1d6a0] group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    deleteOpenedId(openedId);
                    if (isActive) {
                      // Navigate to home or the next available tab
                      const remainingIds = openedIds.filter(
                        (id) => id !== openedId,
                      );
                      if (remainingIds.length > 0) {
                        navigate({
                          to: "/projects/$id",
                          params: { id: remainingIds[0] },
                        });
                      } else {
                        navigate({ to: "/" });
                      }
                    }
                  }}
                >
                  <X className="size-3" />
                </Button>
              </VmNavChip>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Add new project button */}
      <VmButton
        tone="muted"
        size="icon"
        className="mr-2 size-8 shrink-0 rounded-full border-transparent text-[#9d937f] hover:border-[rgba(214,174,102,0.14)]"
        onClick={() => addProject()}
        title="New project"
      >
        <Plus className="size-4" />
      </VmButton>
    </div>
  );
}
