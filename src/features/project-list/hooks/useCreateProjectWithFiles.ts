import { projects } from "@/services/projects";
import { resources } from "@/services/resources";
import { useNavigate } from "@tanstack/react-router";

export function useCreateProjectWithFiles() {
  const navigate = useNavigate();
  const { mutateAsync: createProject } = projects.save.useMutation();
  const { mutateAsync: addResources } = resources.save.useMutation();

  const handleCreateProjectWithFiles = async (files: File[]) => {
    try {
      // Generate title from first file name or fallback to "New Project"
      const firstFileName = files[0]?.name || "New Project";
      const title = firstFileName.replace(/\.[^/.]+$/, ""); // Remove file extension

      // Create new project
      const newProject = await createProject({
        title,
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
    } catch (error) {
      console.error("Failed to create project with files:", error);
      // User will see the error through the mutation's error state
    }
  };

  return handleCreateProjectWithFiles;
}
