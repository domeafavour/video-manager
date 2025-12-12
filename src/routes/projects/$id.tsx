import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { ProjectEntity } from "@/typings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/projects/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectEntity | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      const data = await db.getProject(Number(id));
      if (data) {
        setProject(data);
        setTitle(data.title || "");
      }
    };
    loadProject();
  }, [id]);

  const handleSave = async () => {
    if (!project) return;
    const updatedProject = await db.saveProject({ ...project, title });
    setProject(updatedProject);
  };

  const handleDelete = async () => {
    if (!project) return;
    if (confirm("Are you sure you want to delete this project?")) {
      await db.deleteProject(project.id);
      navigate({ to: "/projects" });
    }
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 gap-4">
        <Input
          value={title}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold text-blue-600 h-auto py-2 px-4"
        />
        <div className="flex gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
