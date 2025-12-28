import { resources } from "@/services/resources";

export function useAddResourcesToProject() {
  const { mutate: addResources } = resources.save.useMutation();

  const handleAddResources = (projectId: number | string, files: File[]) => {
    addResources({
      files,
      projectId,
    });
  };

  return handleAddResources;
}
