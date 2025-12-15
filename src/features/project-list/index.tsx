import { ResponseGrid } from "@/components/ui/responsive-grid";
import { projects } from "@/services/projects";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export function ProjectList() {
  const navigate = useNavigate();
  const { data } = projects.list.useQuery();
  const { mutate, isPending } = projects.save.useMutation({
    onSuccess: (d) => {
      navigate({
        to: "/projects/$id",
        params: { id: d.id.toString() },
      });
    },
  });

  const handleAddProject = async () => {
    mutate({
      title: "New Project",
    });
  };

  if (!data) {
    return null;
  }

  return (
    <div className="">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">Projects</h1>

      <ResponseGrid>
        {data.map((project) => (
          <Link
            key={project.id}
            to="/projects/$id"
            params={{ id: project.id.toString() }}
            className="group block border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
          >
            <ResponseGrid.Item className="aspect-square p-2 flex flex-col">
              {/* Thumbnails Grid */}
              <div className="flex-1 grid grid-cols-3 grid-rows-2 mb-4 rounded-sm overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 border border-gray-200" />
                ))}
              </div>

              {/* Title */}
              <div className="font-bold text-lg truncate">{project.title}</div>
            </ResponseGrid.Item>
          </Link>
        ))}

        {/* Add New Project Card */}
        <button
          onClick={handleAddProject}
          className="group border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white aspect-square flex items-center justify-center cursor-pointer"
          disabled={isPending}
        >
          <Plus className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
        </button>
      </ResponseGrid>
    </div>
  );
}
