import { resources } from "@/services/resources";

export function useDeleteResource() {
  const { mutate } = resources.delete.useMutation();
  async function handleDeleteResource(resourceId: number) {
    if (confirm("Are you sure you want to delete this resource?")) {
      mutate({ id: resourceId });
    }
  }
  return [handleDeleteResource] as const;
}
