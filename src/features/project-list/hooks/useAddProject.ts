import { projects } from "@/services/projects";
import { useNavigate } from "@tanstack/react-router";

export function useAddProject() {
  const navigate = useNavigate();

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

  return [handleAddProject, isPending] as const;
}
