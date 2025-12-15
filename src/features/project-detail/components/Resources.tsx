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
import { ResponseGrid } from "@/components/ui/responsive-grid";
import { db } from "@/lib/db";
import { dragState } from "@/lib/drag-state";
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
      <ResponseGrid>
        {materials?.map((material) => (
          <ContextMenu key={material.id}>
            <ContextMenuTrigger>
              <ResponseGrid.Item
                draggable
                onDragStart={(e) => {
                  e.preventDefault();
                  dragState.isInternal = true;
                  db.startDrag(material.path);
                }}
                className="group cursor-move"
              >
                <ResourceThumbnail
                  path={material.path}
                  className="w-full h-32 rounded-none border-0 border-b bg-gray-50"
                />
                <div className="p-3">
                  <div
                    className="font-medium truncate text-sm"
                    title={material.name}
                  >
                    {material.name}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-gray-500">
                      {formatBytes(material.size)}
                    </div>
                  </div>
                </div>
              </ResponseGrid.Item>
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
          <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No materials added yet. Drag and drop files here to get started.
          </div>
        )}
      </ResponseGrid>

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
