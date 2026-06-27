import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { projects } from "@/services/projects";
import {
  setSearchQuery,
  toggleProjectListType,
  useProjectListType,
  useSearchQuery,
} from "@/stores/settings";
import { Link } from "@tanstack/react-router";
import { FolderPlus, Grid, List, Plus, SearchX } from "lucide-react";
import { useMemo } from "react";
import { useDebounce } from "use-debounce";
import { DropZone } from "./components/DropZone";
import { HighlightText } from "./components/HighlightText";
import { ProjectTags } from "./components/ProjectTags";
import { SearchInput } from "./components/SearchInput";
import { Thumbnails } from "./components/Thumbnails";
import { useAddProject } from "./hooks/useAddProject";
import { useAddResourcesToProject } from "./hooks/useAddResourcesToProject";
import { useCreateProjectWithFiles } from "./hooks/useCreateProjectWithFiles";

function LoadingGrid() {
  return (
    <ResponsiveGrid>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border border-border rounded-md overflow-hidden bg-card"
        >
          <Skeleton className="w-full aspect-[3/2] rounded-none" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </ResponsiveGrid>
  );
}

function LoadingList() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 border border-border rounded-md bg-card"
        >
          <Skeleton className="h-10 w-10 rounded-md shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectList() {
  const { data, isLoading } = projects.list.useQuery();
  const [handleAddProject, isPending] = useAddProject();
  const addResourcesToProject = useAddResourcesToProject();
  const createProjectWithFiles = useCreateProjectWithFiles();
  const projectListType = useProjectListType();
  const searchQuery = useSearchQuery();
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const filteredData = useMemo(() => {
    if (!data) return data;
    if (!debouncedQuery.trim()) return data;
    const query = debouncedQuery.toLowerCase().trim();
    return data.filter(
      (project) =>
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [data, debouncedQuery]);

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex w-full flex-row justify-end items-center gap-2">
            <Skeleton className="h-9 w-64 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
        {projectListType === "grid" ? <LoadingGrid /> : <LoadingList />}
      </div>
    );
  }

  /* ── Empty state (no projects at all) ── */
  if (data && data.length === 0 && !debouncedQuery) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex w-full flex-row justify-end items-center gap-2">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
            <button
              onClick={toggleProjectListType}
              className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title={
                projectListType === "grid"
                  ? "Switch to list view"
                  : "Switch to grid view"
              }
            >
              {projectListType === "grid" ? (
                <List className="w-5 h-5" />
              ) : (
                <Grid className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-muted rounded-full p-4 mb-4">
            <FolderPlus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            No projects yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Create your first project to start organizing your video resources.
          </p>
          <button
            onClick={handleAddProject}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            disabled={isPending}
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex w-full flex-row justify-end items-center gap-2">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          <button
            onClick={toggleProjectListType}
            className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title={
              projectListType === "grid"
                ? "Switch to list view"
                : "Switch to grid view"
            }
          >
            {projectListType === "grid" ? (
              <List className="w-5 h-5" />
            ) : (
              <Grid className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {projectListType === "grid" ? (
        <ResponsiveGrid>
          {filteredData?.map((project) => (
            <DropZone
              key={project.id}
              onDrop={(files) => addResourcesToProject(project.id, files)}
            >
              <Link
                to="/projects/$id"
                params={{ id: project.id.toString() }}
                className="group flex flex-col border border-border rounded-md overflow-hidden hover:border-ring/50 transition-colors bg-card h-full"
              >
                {/* Thumbnails Grid */}
                <Thumbnails projectId={project.id} />

                {/* Info area */}
                <div className="flex flex-col justify-between p-2">
                  <div className="font-semibold text-sm truncate text-foreground">
                    <HighlightText
                      text={project.title}
                      query={debouncedQuery}
                    />
                  </div>
                  {project.description && (
                    <div className="text-xs text-muted-foreground/70 truncate">
                      <HighlightText
                        text={project.description}
                        query={debouncedQuery}
                      />
                    </div>
                  )}
                  <ProjectTags tags={project.tags} query={debouncedQuery} />
                  <div className="text-xs text-muted-foreground">
                    {project.resourcesCount} resource(s)
                  </div>
                </div>
              </Link>
            </DropZone>
          ))}

          {/* Add New Project Card */}
          <DropZone
            className="w-full"
            onDrop={(files) => createProjectWithFiles(files)}
          >
            <button
              onClick={handleAddProject}
              className="group w-full flex flex-col items-center justify-center border border-border rounded-md overflow-hidden hover:border-primary/50 transition-colors bg-card h-full min-h-[200px] cursor-pointer"
              disabled={isPending}
            >
              <Plus className="w-12 h-12 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
            </button>
          </DropZone>
        </ResponsiveGrid>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredData?.map((project) => (
            <DropZone
              key={project.id}
              onDrop={(files) => addResourcesToProject(project.id, files)}
            >
              <Link
                to="/projects/$id"
                params={{ id: project.id.toString() }}
                className="group flex items-center gap-4 p-3 border border-border rounded-lg hover:border-ring/50 transition-colors bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate text-foreground">
                    <HighlightText
                      text={project.title}
                      query={debouncedQuery}
                    />
                  </div>
                  {project.description && (
                    <div className="text-xs text-muted-foreground/70 truncate">
                      <HighlightText
                        text={project.description}
                        query={debouncedQuery}
                      />
                    </div>
                  )}

                  <ProjectTags tags={project.tags} query={debouncedQuery} />
                  <div className="text-xs text-muted-foreground">
                    {project.resourcesCount} resource(s)
                  </div>
                </div>
              </Link>
            </DropZone>
          ))}

          {/* Add New Project Button */}
          <DropZone onDrop={(files) => createProjectWithFiles(files)}>
            <button
              onClick={handleAddProject}
              className="group flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-lg hover:border-primary/50 transition-colors bg-card cursor-pointer"
              disabled={isPending}
            >
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-muted-foreground group-hover:text-primary font-medium transition-colors">
                Add Project
              </span>
            </button>
          </DropZone>

          {/* ── Empty search results ── */}
          {filteredData && filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-3 mb-3">
                <SearchX className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                No projects match
              </h3>
              <p className="text-sm text-muted-foreground">
                Try a different search term or{" "}
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  clear filters
                </button>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
