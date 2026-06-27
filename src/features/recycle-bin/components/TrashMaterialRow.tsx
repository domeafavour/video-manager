import { Button } from "@/components/ui/button";
import { formatBytes } from "@/utils/formatBytes";
import type { MaterialEntity } from "@/typings";
import { RotateCcw } from "lucide-react";
import { useProjectName } from "../hooks/useProjectName";
import { PermanentDeleteDialog } from "./PermanentDeleteDialog";

interface Props {
  material: MaterialEntity;
  onRestore: (id: number) => void;
  onPermanentDelete: (id: number, shouldDeleteNative: boolean) => void;
}

export function TrashMaterialRow({
  material,
  onRestore,
  onPermanentDelete,
}: Props) {
  const projectName = useProjectName(material.projectId);

  return (
    <div className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card">
      {/* Thumbnail */}
      <div className="size-12 shrink-0 rounded-md bg-muted overflow-hidden">
        <img
          src={`file://${material.path}`}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{material.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatBytes(material.size)} — From: {projectName}
        </div>
        <div className="text-xs text-muted-foreground">
          Deleted:{" "}
          {material.deletedAt
            ? new Date(material.deletedAt).toLocaleString()
            : "Unknown"}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRestore(material.id)}
        >
          <RotateCcw className="size-3.5 mr-1" />
          Restore
        </Button>
        <PermanentDeleteDialog
          material={material}
          onConfirm={(shouldDeleteNative) => {
            onPermanentDelete(material.id, shouldDeleteNative);
          }}
        />
      </div>
    </div>
  );
}
