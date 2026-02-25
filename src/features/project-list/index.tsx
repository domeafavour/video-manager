import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { projects } from "@/services/projects";
import { toggleProjectListType, useProjectListType } from "@/stores/settings";
import { Link } from "@tanstack/react-router";
import { Grid, List, Plus } from "lucide-react";
import { DropZone } from "./components/DropZone";
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

  return (
    <div className="">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Projects</h1>
        <button
          onClick={toggleProjectListType}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          title={
            projectListType === "grid"
              ? "Switch to list view"
              : "Switch to grid view"
          }
        >
          {projectListType === "grid" ? (
            <List className="w-5 h-5 text-gray-600" />
          ) : (
            <Grid className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {projectListType === "grid" ? (
        <ResponsiveGrid>
          {data?.map((project) => (
            <DropZone
              key={project.id}
              onDrop={(files) => addResourcesToProject(project.id, files)}
            >
              <Link
                to="/projects/$id"
                params={{ id: project.id.toString() }}
                className="group block border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white h-full"
              >
                <ResponsiveGrid.Item className="p-2 flex flex-col border-none hover:shadow-none h-full">
                  {/* Thumbnails Grid */}
                  <Thumbnails projectId={project.id} />

                  {/* Title */}
                  <div className="flex flex-col justify-between mt-1">
                    <div className="font-bold text-sm truncate">
                      {project.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {project.resourcesCount} resource(s)
                    </div>
                  </div>
                </ResponsiveGrid.Item>
              </Link>
            </DropZone>
          ))}

          {/* Add New Project Card */}
          <DropZone onDrop={(files) => createProjectWithFiles(files)}>
            <button
              onClick={handleAddProject}
              className="group border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white aspect-square flex items-center justify-center cursor-pointer h-full"
              disabled={isPending}
            >
              <Plus className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
            </button>
          </DropZone>
        </ResponsiveGrid>
      ) : (
        <div className="flex flex-col gap-2">
          {data?.map((project) => (
            <DropZone
              key={project.id}
              onDrop={(files) => addResourcesToProject(project.id, files)}
            >
              <Link
                to="/projects/$id"
                params={{ id: project.id.toString() }}
                className="group flex items-center gap-4 p-3 border-2 border-gray-200 rounded-lg hover:shadow-lg transition-shadow bg-white"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">
                    {project.title}
                  </div>
                  <div className="text-xs text-gray-500">
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
              className="group flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:shadow-lg hover:border-blue-400 transition-all bg-white cursor-pointer"
              disabled={isPending}
            >
              <Plus className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-blue-600 font-medium">Add Project</span>
            </button>
          </DropZone>
        </div>
      )}
    </div>
  );
}
