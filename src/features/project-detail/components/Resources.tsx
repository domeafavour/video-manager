import { ResourceThumbnail } from "@/components/ResourceThumbnail";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db } from "@/lib/db";
import { resources } from "@/services/resources";
import { isImage, isVideo } from "@/utils/file-type";
import { formatBytes } from "@/utils/formatBytes";
import { useState } from "react";
import { useDeleteResource } from "../hooks/useDeleteResource";

interface Props {
  projectId: string | number;
}

export type ResourcesProps = Props;

export function Resources({ projectId }: Props) {
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const { data: materials } = resources.list.useQuery({ variables: projectId });
  const [handleDeleteResource] = useDeleteResource();

  function handleOpenFolder(path: string) {
    db.openFileLocation(path);
  }

  function handleCopyPath(path: string) {
    navigator.clipboard.writeText(path);
  }

  const handlePreview = (path: string) => {
    setPreviewPath(path);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {materials?.map((material, index) => (
          <ContextMenu key={material.id}>
            <ContextMenuTrigger>
              <div
                draggable
                onDragStart={(e) => {
                  e.preventDefault();
                  db.startDrag(material.path);
                }}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-move ${
                  index !== materials.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-center flex-1 min-w-0 mr-4">
                  <div className="mr-4">
                    <ResourceThumbnail path={material.path} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate" title={material.name}>
                      {material.name}
                    </div>
                    <div
                      className="text-sm text-gray-500 truncate"
                      title={material.path}
                    >
                      {material.path}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-sm text-gray-500">
                    {formatBytes(material.size)}
                  </div>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {(isImage(material.path) || isVideo(material.path)) && (
                <ContextMenuItem onClick={() => handlePreview(material.path)}>
                  Preview
                </ContextMenuItem>
              )}
              <ContextMenuItem onClick={() => handleOpenFolder(material.path)}>
                Open containing folder
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCopyPath(material.path)}>
                Copy path
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => handleDeleteResource(material.id)}
              >
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        {materials?.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No materials added yet. Click "Add Material" to get started.
          </div>
        )}
      </div>

      <Dialog
        open={!!previewPath}
        onOpenChange={(open) => !open && setPreviewPath(null)}
      >
        <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/5 rounded-md">
            {previewPath && isImage(previewPath) && (
              <img
                src={`file://${previewPath}`}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            )}
            {previewPath && isVideo(previewPath) && (
              <video
                src={`file://${previewPath}`}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
