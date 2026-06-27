import { Skeleton } from "@/components/ui/skeleton";
import { resources } from "@/services/resources";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyTrashDialog } from "./components/EmptyTrashDialog";
import { TrashMaterialRow } from "./components/TrashMaterialRow";

export function RecycleBinPage() {
  const { data: trashMaterials, isLoading } = resources.trashList.useQuery();
  const restoreMutation = resources.trashRestore.useMutation();
  const deleteMutation = resources.trashDelete.useMutation();
  const emptyMutation = resources.trashEmpty.useMutation();

  const handleRestore = (id: number) => {
    restoreMutation.mutate(
      { id },
      {
        onSuccess: () => toast.success("Resource restored"),
        onError: () => toast.error("Failed to restore resource"),
      },
    );
  };

  const handlePermanentDelete = (id: number, shouldDeleteNative: boolean) => {
    deleteMutation.mutate(
      { id, shouldDeleteNative },
      {
        onSuccess: () => toast.success("Resource permanently deleted"),
        onError: () => toast.error("Failed to delete resource"),
      },
    );
  };

  const handleEmptyTrash = (deleteNative: boolean) => {
    emptyMutation.mutate(
      { deleteNative },
      {
        onSuccess: () => toast.success("Recycle bin emptied"),
        onError: () => toast.error("Failed to empty recycle bin"),
      },
    );
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Recycle Bin</h1>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-2xl font-semibold">Recycle Bin</h1>
        </div>
        {trashMaterials && trashMaterials.length > 0 && (
          <EmptyTrashDialog
            itemCount={trashMaterials.length}
            onConfirm={handleEmptyTrash}
          />
        )}
      </div>

      {!trashMaterials || trashMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Trash2 className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Recycle bin is empty
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Deleted resources will appear here. You can restore them or
            permanently delete them.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            {trashMaterials.length} item(s) in recycle bin
          </p>
          {trashMaterials.map((material) => (
            <TrashMaterialRow
              key={material.id}
              material={material}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
