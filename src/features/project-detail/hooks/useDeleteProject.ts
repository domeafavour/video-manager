import { projects } from "@/services/projects";
import { useNavigate } from "@tanstack/react-router";

export function useDeleteProject() {
  const navigate = useNavigate();
  const { mutate } = projects.delete.useMutation({
    onSuccess: () => {
      navigate({ to: "/projects" });
    },
  });

  const handleDelete = async (projectId: string | number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      mutate({ id: projectId });
    }
  };
  return [handleDelete] as const;
}
