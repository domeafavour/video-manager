import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { projects } from "@/services/projects";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Thumbnails } from "./components/Thumbnails";
import { useAddProject } from "./hooks/useAddProject";

export function ProjectList() {
  const { data } = projects.list.useQuery();
  const [handleAddProject, isPending] = useAddProject();

  if (!data) {
    return null;
  }

  return (
    <div className="">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">Projects</h1>

      <ResponsiveGrid>
        {data.map((project) => (
          <Link
            key={project.id}
            to="/projects/$id"
            params={{ id: project.id.toString() }}
            className="group block border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
          >
            <ResponsiveGrid.Item className="aspect-square p-2 flex flex-col border-none">
              {/* Thumbnails Grid */}
              <Thumbnails projectId={project.id} />

              {/* Title */}
              <div className="font-bold text-lg truncate">{project.title}</div>
            </ResponsiveGrid.Item>
          </Link>
        ))}

        {/* Add New Project Card */}
        <button
          onClick={handleAddProject}
          className="group border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white aspect-square flex items-center justify-center cursor-pointer"
          disabled={isPending}
        >
          <Plus className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
        </button>
      </ResponsiveGrid>
    </div>
  );
}
