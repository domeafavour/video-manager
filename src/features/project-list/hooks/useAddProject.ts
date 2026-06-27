import { projects } from "@/services/projects";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useAddProject() {
  const navigate = useNavigate();

  const { mutate, isPending } = projects.save.useMutation({
    onSuccess: (d) => {
      toast.success("Project created");
      navigate({
        to: "/projects/$id",
        params: { id: d.id.toString() },
      });
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  const handleAddProject = async () => {
    mutate({
      title: "New Project",
    });
  };

  return [handleAddProject, isPending] as const;
}
