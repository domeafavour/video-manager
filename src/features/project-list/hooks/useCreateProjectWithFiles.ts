import { projects } from "@/services/projects";
import { resources } from "@/services/resources";
import { useNavigate } from "@tanstack/react-router";

export function useCreateProjectWithFiles() {
  const navigate = useNavigate();
  const { mutateAsync: createProject } = projects.save.useMutation();
  const { mutateAsync: addResources } = resources.save.useMutation();

  const handleCreateProjectWithFiles = async (files: File[]) => {
    // Create new project
    const newProject = await createProject({
      title: "New Project",
    });

    // Add resources to the project
    await addResources({
      files,
      projectId: newProject.id,
    });

    // Navigate to the new project
    navigate({
      to: "/projects/$id",
      params: { id: newProject.id.toString() },
    });
  };

  return handleCreateProjectWithFiles;
}
