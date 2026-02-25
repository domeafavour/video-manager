import { db } from "@/lib/db";
import { resources } from "@/services/resources";

export function useDeleteResource() {
  const { mutateAsync } = resources.delete.useMutation();

  async function handleDeleteResource(resourceId: number) {
    // First confirm resource deletion
    if (!confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    // Get the material to check its path
    const material = await db.getMaterial(resourceId);
    if (!material) {
      return;
    }

    const filePath = material.path;

    // Delete the resource from database
    await mutateAsync({ id: resourceId });

    // Check if this file is used by other materials
    const materialsWithSamePath = await db.getMaterialsByPath(filePath);

    // If no other materials use this file, ask to delete native file
    if (materialsWithSamePath.length === 0) {
      const shouldDeleteNative = confirm(
        "This file is not used by any other projects. Do you want to delete the native file as well?\n\n" +
          filePath
      );

      if (shouldDeleteNative) {
        const result = await db.deleteNativeFile(filePath);
        if (!result.success) {
          alert(`Failed to delete native file: ${result.error}`);
        }
      }
    }
  }

  return [handleDeleteResource] as const;
}
