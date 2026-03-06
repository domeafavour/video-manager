import { ResourceThumbnail } from "@/components/ResourceThumbnail";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { db } from "@/lib/db";
import { dragState } from "@/lib/drag-state";
import { cn } from "@/lib/utils";
import { resources } from "@/services/resources";
import { isImage, isVideo } from "@/utils/file-type";
import { formatBytes } from "@/utils/formatBytes";
import { isTimeTag } from "@/utils/time-tag";
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  FolderIcon,
  GripVertical,
  MoreHorizontalIcon,
  Tags,
  Trash,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { DeleteResource } from "./DeleteResource";
import { EditResourceTags } from "./EditResourceTags";
import { PreviewResource } from "./PreviewResource";

interface Props {
  projectId: string | number;
}

export type ResourcesProps = Props;

export function Resources({ projectId }: Props) {
  const [statusFilter, setStatusFilter] = useState<"all" | "used" | "unused">(
    "all",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<number[]>([]);
  const { data: materials } = resources.list.useQuery({ variables: projectId });
  const { mutate: updateStatus } = resources.updateStatus.useMutation();

  function handleOpenFolder(path: string) {
    db.openFileLocation(path);
  }

  function handleCopyPath(path: string) {
    navigator.clipboard.writeText(path);
  }

  const handleSetStatus = (id: number, status: "used" | "unused") => {
    updateStatus({ id, status });
  };

  const allProjectTags = Array.from(
    new Set(materials?.flatMap((m) => m.tags ?? []) ?? []),
  ).sort();

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredMaterials = materials?.filter((material) => {
    if (statusFilter !== "all" && material.status !== statusFilter) {
      return false;
    }
    if (selectedTags.length > 0) {
      return selectedTags.every((tag) => material.tags?.includes(tag));
    }
    return true;
  });

  const selectedResources =
    materials?.filter((material) =>
      selectedResourceIds.includes(material.id),
    ) ?? [];

  const selectedResourceCount = selectedResources.length;

  const toggleResourceSelection = (resourceId: number) => {
    setSelectedResourceIds((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId],
    );
  };

  const clearResourceSelection = () => {
    setSelectedResourceIds([]);
  };

  const handleResourceDragStart = (
    resourcePath: string,
    resourceId: number,
  ) => {
    const isDraggingFromSelection = selectedResourceIds.includes(resourceId);
    const selectedPaths = selectedResources.map((resource) => resource.path);
    const pathsToDrag =
      isDraggingFromSelection && selectedPaths.length > 0
        ? selectedPaths
        : [resourcePath];

    dragState.isInternal = true;
    db.startDrag(pathsToDrag);
  };

  const handleSelectedResourcesDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    if (selectedResources.length === 0) {
      return;
    }
    dragState.isInternal = true;
    db.startDrag(selectedResources.map((resource) => resource.path));
  };

  const handleInternalDragEnd = () => {
    dragState.isInternal = false;
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ButtonGroup>
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
        </ButtonGroup>
        {allProjectTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {allProjectTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={cn(
                  "text-xs px-2 py-1 rounded-full border transition-colors",
                  selectedTags.includes(tag)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50",
                )}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
      {selectedResourceCount > 0 && (
        <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50 pointer-events-none">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/95 px-1 py-1 shadow-lg backdrop-blur-sm pointer-events-auto">
            <button
              type="button"
              draggable
              onDragStart={handleSelectedResourcesDragStart}
              onDragEnd={handleInternalDragEnd}
              className={cn(
                "inline-flex flex-row items-center gap-1",
                "min-w-12 h-8 px-3 py-1 text-sm rounded-full border border-blue-500 bg-blue-50 text-blue-700 font-semibold cursor-grab active:cursor-grabbing",
              )}
              title="Drag selected resources"
            >
              <GripVertical className="size-4 text-muted-foreground" />
              {selectedResourceCount} Resource
              {selectedResourceCount > 1 ? "s" : ""}
            </button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={clearResourceSelection}
              title="Clear selected resources"
              className="h-8 w-8 rounded-full"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}
      <ResponsiveGrid>
        {filteredMaterials?.map((material) => (
          <ResponsiveGrid.Item
            key={material.id}
            draggable
            onDragStart={(e) => {
              e.preventDefault();
              handleResourceDragStart(material.path, material.id);
            }}
            onDragEnd={handleInternalDragEnd}
            className="group cursor-move relative shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleResourceSelection(material.id);
              }}
              className={cn(
                "absolute top-2 left-2 z-20 size-5 rounded-sm border backdrop-blur-sm shadow-sm flex items-center justify-center transition-colors",
                selectedResourceIds.includes(material.id)
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white/85 border-white/80 text-transparent hover:bg-white",
              )}
              aria-label={
                selectedResourceIds.includes(material.id)
                  ? "Deselect resource"
                  : "Select resource"
              }
              title={
                selectedResourceIds.includes(material.id)
                  ? "Deselect resource"
                  : "Select resource"
              }
            >
              <CheckIcon className="size-4" />
            </button>
            {/* Thumbnail area with overlay */}
            <div className="relative overflow-hidden">
              <ResourceThumbnail
                path={material.path}
                className="w-full h-36 rounded-none border-0 bg-muted/50 group-hover:scale-105  transition-transform duration-500"
              />
              {/* Gradient overlay for better button visibility */}
              <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent " />
              {/* Action buttons - appear on hover */}
              <ButtonGroup className="absolute top-2 right-2 flex -translate-y-1 ">
                {(isImage(material.path) || isVideo(material.path)) && (
                  <PreviewResource resource={material}>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                    >
                      <EyeIcon className="size-3.5" />
                    </Button>
                  </PreviewResource>
                )}
                <EditResourceTags
                  resourceId={material.id}
                  tags={material.tags}
                  allProjectTags={allProjectTags}
                >
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                  >
                    <Tags className="size-3.5" />
                  </Button>
                </EditResourceTags>
                <DeleteResource
                  resourceId={material.id}
                  resourcePath={material.path}
                >
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white hover:text-destructive shadow-sm"
                  >
                    <Trash className="size-3.5" />
                  </Button>
                </DeleteResource>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                      aria-label="More Options"
                    >
                      <MoreHorizontalIcon className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        handleOpenFolder(material.path);
                      }}
                    >
                      <FolderIcon />
                      Open containing folder
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        handleCopyPath(material.path);
                      }}
                    >
                      <CopyIcon />
                      Copy Path
                    </DropdownMenuItem>
                    {material.status === "used" ? (
                      <DropdownMenuItem
                        onClick={() => handleSetStatus(material.id, "unused")}
                      >
                        <XIcon />
                        Mark as Unused
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleSetStatus(material.id, "used")}
                      >
                        <CheckIcon />
                        Mark as Used
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>
              {/* Status badge - positioned on thumbnail */}
              <div
                className={cn(
                  "absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm",
                  material.status === "used"
                    ? "bg-green-500/90 text-white"
                    : "bg-white/90 text-muted-foreground",
                )}
              >
                {material.status === "used" ? "Used" : "Unused"}
              </div>
            </div>
            {/* Info section */}
            <div className="p-3 space-y-2">
              <div
                className="font-medium truncate text-sm leading-tight"
                title={material.name}
              >
                {material.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(material.size)}
              </div>
              {material.tags && material.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {material.tags.slice(0, 4).map((tag) => {
                    const isTime = isTimeTag(tag);
                    return (
                      <span
                        key={tag}
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                          isTime
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                        )}
                      >
                        {tag}
                      </span>
                    );
                  })}
                  {material.tags.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                      +{material.tags.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </ResponsiveGrid.Item>
        ))}
        {!filteredMaterials?.length && (
          <div className="col-span-full text-center py-16 text-muted-foreground bg-muted/30 rounded-xl border-2 border-dashed">
            <div className="text-4xl mb-3">📁</div>
            <div className="font-medium">
              {materials?.length
                ? "No materials match the selected filter"
                : "No materials yet"}
            </div>
            <div className="text-sm mt-1">
              {materials?.length
                ? "Try selecting a different filter or clearing tag filters"
                : "Drag and drop files here to get started"}
            </div>
          </div>
        )}
      </ResponsiveGrid>
    </>
  );
}
