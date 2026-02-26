import { ResourceThumbnail } from "@/components/ResourceThumbnail";
import { Button } from "@/components/ui/button";
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
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { db } from "@/lib/db";
import { dragState } from "@/lib/drag-state";
import { cn } from "@/lib/utils";
import { resources } from "@/services/resources";
import { isImage, isVideo } from "@/utils/file-type";
import { formatBytes } from "@/utils/formatBytes";
import { isTimeTag } from "@/utils/time-tag";
import { useState } from "react";
import { DeleteResource } from "./DeleteResource";
import { EditTagsDialog } from "./EditTagsDialog";
import { VideoPreviewDialog } from "./VideoPreviewDialog";

interface Props {
  projectId: string | number;
}

export type ResourcesProps = Props;

export function Resources({ projectId }: Props) {
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<{
    id: number;
    path: string;
    tags: string[];
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "used" | "unused">(
    "all",
  );
  const { data: materials } = resources.list.useQuery({ variables: projectId });
  const { mutate: updateStatus } = resources.updateStatus.useMutation();
  const [editingTagsResource, setEditingTagsResource] = useState<{
    id: number;
    tags: string[];
  } | null>(null);

  function handleOpenFolder(path: string) {
    db.openFileLocation(path);
  }

  function handleCopyPath(path: string) {
    navigator.clipboard.writeText(path);
  }

  const handlePreview = (material: { id: number; path: string; tags?: string[] }) => {
    if (isVideo(material.path)) {
      setVideoPreview({
        id: material.id,
        path: material.path,
        tags: material.tags || [],
      });
    } else {
      setPreviewPath(material.path);
    }
  };

  const handleSetStatus = (id: number, status: "used" | "unused") => {
    updateStatus({ id, status });
  };

  const filteredMaterials = materials?.filter((material) => {
    if (statusFilter === "all") return true;
    return material.status === statusFilter;
  });

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "used" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("used")}
        >
          Used
        </Button>
        <Button
          variant={statusFilter === "unused" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("unused")}
        >
          Unused
        </Button>
      </div>
      <ResponsiveGrid>
        {filteredMaterials?.map((material) => (
          <ContextMenu key={material.id}>
            <ContextMenuTrigger>
              <ResponsiveGrid.Item
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
                  className="w-full h-32 rounded-none border-0 border-b bg-gray-50 hover:scale-110 transition-transform duration-500"
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
                    <div
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        material.status === "used"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {material.status}
                    </div>
                  </div>
                  {material.tags && material.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {material.tags.map((tag) => {
                        const isTime = isTimeTag(tag);
                        return (
                          <span
                            key={tag}
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded border",
                              isTime
                                ? "bg-purple-50 text-purple-700 border-purple-200 font-mono"
                                : "bg-blue-50 text-blue-600 border-blue-100",
                            )}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ResponsiveGrid.Item>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {(isImage(material.path) || isVideo(material.path)) && (
                <ContextMenuItem onClick={() => handlePreview(material)}>
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
                onClick={() =>
                  setEditingTagsResource({
                    id: material.id,
                    tags: material.tags || [],
                  })
                }
              >
                Edit tags
              </ContextMenuItem>
              <ContextMenuSeparator />
              {material.status === "unused" ? (
                <ContextMenuItem
                  onClick={() => handleSetStatus(material.id, "used")}
                >
                  Set as Used
                </ContextMenuItem>
              ) : (
                <ContextMenuItem
                  onClick={() => handleSetStatus(material.id, "unused")}
                >
                  Set as Unused
                </ContextMenuItem>
              )}
              <ContextMenuSeparator />
              <DeleteResource resourceId={material.id}>
                <ContextMenuItem className="text-red-600 focus:text-red-600">
                  Delete
                </ContextMenuItem>
              </DeleteResource>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        {!filteredMaterials?.length && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            {materials?.length
              ? "No materials match the selected filter."
              : "No materials added yet. Drag and drop files here to get started."}
          </div>
        )}
      </ResponsiveGrid>
      {editingTagsResource && (
        <EditTagsDialog
          open={!!editingTagsResource}
          onOpenChange={(open) => !open && setEditingTagsResource(null)}
          resourceId={editingTagsResource.id}
          initialTags={editingTagsResource.tags}
        />
      )}
      {videoPreview && (
        <VideoPreviewDialog
          open={!!videoPreview}
          onOpenChange={(open) => !open && setVideoPreview(null)}
          resourceId={videoPreview.id}
          resourcePath={videoPreview.path}
          initialTags={videoPreview.tags}
        />
      )}
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
