import { VmEyebrow, VmShell, VmShellGlow, VmTitle } from "@/components/ui/vm";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { projects } from "@/services/projects";
import {
  setSearchQuery,
  toggleProjectListType,
  useProjectListType,
  useSearchQuery,
} from "@/stores/settings";
import { Link } from "@tanstack/react-router";
import { Grid, List, Plus } from "lucide-react";
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

export function ProjectList() {
  const { data } = projects.list.useQuery();
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

  return (
    <VmShell className="min-h-full overflow-hidden p-6 md:p-7">
      <VmShellGlow aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_3px)] opacity-20 mix-blend-soft-light"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <VmEyebrow className="tracking-[0.2em]">
            Projects
          </VmEyebrow>
          {filteredData && (
            <span className="text-[11px] text-[#a39a8c]">
              {filteredData.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          <div className="flex items-center gap-0.5 rounded-md border border-[rgba(214,174,102,0.18)] bg-[rgba(255,255,255,0.04)] p-0.5">
            <button
              onClick={() =>
                projectListType !== "grid" && toggleProjectListType()
              }
              className={`rounded p-1.5 transition-all ${
                projectListType === "grid"
                  ? "bg-[rgba(214,174,102,0.2)] text-[#d6ae66]"
                  : "text-[#8d8578]"
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                projectListType !== "list" && toggleProjectListType()
              }
              className={`rounded p-1.5 transition-all ${
                projectListType === "list"
                  ? "bg-[rgba(214,174,102,0.2)] text-[#d6ae66]"
                  : "text-[#8d8578]"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        </div>

        {projectListType === "grid" ? (
          <ResponsiveGrid>
          {filteredData?.map((project, index) => (
            <DropZone
              key={project.id}
              onDrop={(files) => addResourcesToProject(project.id, files)}
            >
              <div
                className="project-card-animate h-full"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <Link
                  to="/projects/$id"
                  params={{ id: project.id.toString() }}
                  className="group block h-full overflow-hidden rounded-xl border border-[rgba(214,174,102,0.08)] bg-[#1a1c22] transition-all duration-300 hover:border-[rgba(214,174,102,0.38)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.34)]"
                >
                  <div className="relative overflow-hidden bg-[#111]">
                    <Thumbnails projectId={project.id} />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.22)_100%),linear-gradient(90deg,rgba(214,174,102,0.08)_0%,rgba(214,174,102,0)_38%)]"
                    />
                  </div>
                  <div className="p-3 flex flex-col gap-1.5 min-h-28">
                    <VmTitle className="truncate text-[15px] font-semibold leading-tight">
                      <HighlightText
                        text={project.title}
                        query={debouncedQuery}
                      />
                    </VmTitle>
                    {project.description && (
                      <div className="truncate text-[11px] text-[#958d80]">
                        <HighlightText
                          text={project.description}
                          query={debouncedQuery}
                        />
                      </div>
                    )}
                    <ProjectTags tags={project.tags} query={debouncedQuery} />
                    <div className="text-[10px] text-[#857d70]">
                      {project.resourcesCount} resource
                      {project.resourcesCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </Link>
              </div>
            </DropZone>
          ))}

          {/* Add New Project Card */}
          <DropZone onDrop={(files) => createProjectWithFiles(files)}>
            <button
              onClick={handleAddProject}
              disabled={isPending}
              className="group flex h-full min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[rgba(214,174,102,0.24)] bg-transparent transition-all duration-300 hover:border-[rgba(214,174,102,0.45)] hover:bg-[rgba(214,174,102,0.06)]"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(214,174,102,0.26)] bg-[rgba(214,174,102,0.12)] transition-transform group-hover:scale-110"
              >
                <Plus className="h-5 w-5 text-[#d6ae66]" />
              </div>
              <span className="text-[11px] tracking-wide text-[#9d937f]">
                New Project
              </span>
            </button>
          </DropZone>
          </ResponsiveGrid>
        ) : (
          <div className="flex flex-col gap-2">
          {filteredData?.map((project, index) => (
            <DropZone
              key={project.id}
              onDrop={(files) => addResourcesToProject(project.id, files)}
            >
              <div
                className="project-card-animate"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <Link
                  to="/projects/$id"
                  params={{ id: project.id.toString() }}
                  className="group flex rounded-xl border border-[rgba(214,174,102,0.08)] bg-[#1a1c22] px-4 py-3.5 transition-all duration-200 hover:border-[rgba(214,174,102,0.32)] hover:bg-[#1f2128]"
                >
                  <div className="flex-1 min-w-0 py-0.5">
                    <VmTitle className="truncate text-[15px] font-semibold leading-tight">
                      <HighlightText
                        text={project.title}
                        query={debouncedQuery}
                      />
                    </VmTitle>
                    {project.description && (
                      <div className="truncate text-[11px] text-[#958d80]">
                        <HighlightText
                          text={project.description}
                          query={debouncedQuery}
                        />
                      </div>
                    )}
                    <ProjectTags tags={project.tags} query={debouncedQuery} />
                    <div className="mt-1 text-[10px] text-[#857d70]">
                      {project.resourcesCount} resource
                      {project.resourcesCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </Link>
              </div>
            </DropZone>
          ))}

          {/* Add New Project Row */}
          <DropZone onDrop={(files) => createProjectWithFiles(files)}>
            <button
              onClick={handleAddProject}
              disabled={isPending}
              className="group flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-dashed border-[rgba(214,174,102,0.24)] bg-transparent px-4 py-3 transition-all duration-200 hover:border-[rgba(214,174,102,0.4)] hover:bg-[rgba(214,174,102,0.06)]"
            >
              <Plus className="h-4 w-4 text-[#d6ae66] transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium text-[#d6ae66]">
                New Project
              </span>
            </button>
          </DropZone>
          </div>
        )}
      </div>
    </VmShell>
  );
}
