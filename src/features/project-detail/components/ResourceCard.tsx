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
import { cn } from "@/lib/utils";
import { resources } from "@/services/resources";
import { MaterialEntity } from "@/typings";
import { isImage, isVideo } from "@/utils/file-type";
import { formatBytes } from "@/utils/formatBytes";
import { isTimeTag } from "@/utils/time-tag";
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  FolderIcon,
  MoreHorizontalIcon,
  Tags,
  Trash,
  XIcon,
} from "lucide-react";
import { DeleteResource } from "./DeleteResource";
import { EditResourceTags } from "./EditResourceTags";
import { PreviewResource } from "./PreviewResource";

interface ResourceCardProps {
  material: MaterialEntity;
  isSelected: boolean;
  isHighlighted: boolean;
  allProjectTags: string[];
  onToggleSelection: (resourceId: number) => void;
  onDragStart: (resourcePath: string, resourceId: number) => void;
  onDragEnd: () => void;
  onHighlight: (resourceId: number) => void;
}

export function ResourceCard({
  material,
  isSelected,
  isHighlighted,
  allProjectTags,
  onToggleSelection,
  onDragStart,
  onDragEnd,
  onHighlight,
}: ResourceCardProps) {
  const { mutate: updateStatus } = resources.updateStatus.useMutation();

  function onSetStatus(id: number, status: MaterialEntity["status"]) {
    updateStatus({ id, status });
  }

  function handleOpenFolder(path: string) {
    db.openFileLocation(path);
  }

  function handleCopyPath(path: string) {
    navigator.clipboard.writeText(path);
  }

  return (
    <ResponsiveGrid.Item
      key={material.id}
      draggable
      onClickCapture={() => onHighlight(material.id)}
      onDragStart={(e) => {
        e.preventDefault();
        onDragStart(material.path, material.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-move relative shadow-sm hover:shadow-lg transition-all duration-300",
        isHighlighted &&
          "ring-2 ring-sky-500/80 ring-offset-2 ring-offset-background bg-sky-50/30",
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelection(material.id);
        }}
        className={cn(
          "absolute top-2 left-2 z-20 size-5 rounded-sm border backdrop-blur-sm shadow-sm flex items-center justify-center transition-colors",
          isSelected
            ? "bg-blue-500 border-blue-500 text-white"
            : "bg-white/85 border-white/80 text-transparent hover:bg-white",
        )}
        aria-label={isSelected ? "Deselect resource" : "Select resource"}
        title={isSelected ? "Deselect resource" : "Select resource"}
      >
        <CheckIcon className="size-4" />
      </button>

      <div className="relative overflow-hidden">
        <ResourceThumbnail
          path={material.path}
          className="w-full h-36 rounded-none border-0 bg-muted/50 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />

        <ButtonGroup className="absolute top-2 right-2 flex -translate-y-1">
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

          <DeleteResource resourceId={material.id} resourcePath={material.path}>
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
              <DropdownMenuItem onClick={() => handleOpenFolder(material.path)}>
                <FolderIcon />
                Open containing folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopyPath(material.path)}>
                <CopyIcon />
                Copy Path
              </DropdownMenuItem>
              {material.status === "used" ? (
                <DropdownMenuItem
                  onClick={() => onSetStatus(material.id, "unused")}
                >
                  <XIcon />
                  Mark as Unused
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onSetStatus(material.id, "used")}
                >
                  <CheckIcon />
                  Mark as Used
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>

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
  );
}
