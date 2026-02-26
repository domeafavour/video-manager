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

  const filteredMaterials = materials?.filter((material) => {
    if (statusFilter === "all") return true;
    return material.status === statusFilter;
  });

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
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
      </div>
      {/*  */}
      <ResponsiveGrid>
        {filteredMaterials?.map((material) => (
          <ResponsiveGrid.Item
            key={material.id}
            draggable
            onDragStart={(e) => {
              e.preventDefault();
              dragState.isInternal = true;
              db.startDrag(material.path);
            }}
            className="group cursor-move relative"
          >
            <ButtonGroup className="absolute top-1 right-1 z-10">
              {(isImage(material.path) || isVideo(material.path)) && (
                <PreviewResource resource={material}>
                  <Button variant="outline" size="icon">
                    <EyeIcon className="text-primary" />
                  </Button>
                </PreviewResource>
              )}
              <EditResourceTags resourceId={material.id} tags={material.tags}>
                <Button variant="outline" size="icon">
                  <Tags className="text-accent-foreground" />
                </Button>
              </EditResourceTags>
              <DeleteResource
                resourceId={material.id}
                resourcePath={material.path}
              >
                <Button variant="outline" size="icon">
                  <Trash className="text-destructive" />
                </Button>
              </DeleteResource>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="More Options"
                  >
                    <MoreHorizontalIcon />
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
        ))}
        {!filteredMaterials?.length && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            {materials?.length
              ? "No materials match the selected filter."
              : "No materials added yet. Drag and drop files here to get started."}
          </div>
        )}
      </ResponsiveGrid>
    </>
  );
}
