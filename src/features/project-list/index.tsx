import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { projects } from "@/services/projects";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
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

  return (
    <div className="">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">Projects</h1>

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
    </div>
  );
}
