import { useAddProject } from "@/features/project-list/hooks/useAddProject";
import { cn } from "@/lib/utils";
import { projects } from "@/services/projects";
import { deleteOpenedId, useOpenedIds } from "@/stores/opened-projects";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Plus, Video, X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export function AppTabs() {
  const navigate = useNavigate();
  const openedIds = useOpenedIds();
  const { data } = projects.list.useQuery();
  const [addProject] = useAddProject();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const entities = data ? Object.fromEntries(data.map((p) => [p.id, p])) : {};

  return (
    <div className="flex items-center bg-muted/50 border-b">
      {/* App logo/title - fixed */}
      <Link to="/" className="shrink-0">
        <div className="flex items-center gap-2 px-3">
          <div className="bg-primary text-primary-foreground flex aspect-square size-7 items-center justify-center rounded-md">
            <Video className="size-4" />
          </div>
          <span className="font-semibold text-sm hidden sm:inline">
            Video Manager
          </span>
        </div>
      </Link>

      <div className="w-px h-6 bg-border mx-1 shrink-0" />

      {/* Scrollable tabs area */}
      <ScrollArea className="flex-1 w-0 py-3">
        <div className="flex flex-nowrap items-center gap-1 px-1">
          {/* Opened project tabs */}
          {openedIds.map((openedId) => {
            const p = entities[openedId];
            if (!p) return null;

            const isActive = currentPath === `/projects/${openedId}`;

            return (
              <div
                key={openedId}
                className={cn(
                  "group inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-md text-sm font-medium transition-colors shrink-0 max-w-50",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                )}
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
                  className="size-5 opacity-0 group-hover:opacity-100 hover:bg-muted ml-1 shrink-0"
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
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Add new project button */}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => addProject()}
        title="New project"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
