import { db } from "@/lib/db";
import { ProjectEntity } from "@/typings";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/projects/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectEntity[]>([]);

  const loadProjects = async () => {
    const data = await db.getProjects();
    setProjects(data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddProject = async () => {
    const newProject = await db.saveProject({
      title: "New Project",
    });
    navigate({ to: "/projects/$id", params: { id: newProject.id.toString() } });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">Projects</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            to="/projects/$id"
            params={{ id: project.id.toString() }}
            className="group block border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
          >
            <div className="aspect-square p-4 flex flex-col">
              {/* Thumbnails Grid */}
              <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 mb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 border border-gray-200 rounded-sm"
                  />
                ))}
              </div>

              {/* Title */}
              <div className="font-bold text-lg truncate">{project.title}</div>
            </div>
          </Link>
        ))}

        {/* Add New Project Card */}
        <button
          onClick={handleAddProject}
          className="group border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white aspect-square flex items-center justify-center cursor-pointer"
        >
          <Plus className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
