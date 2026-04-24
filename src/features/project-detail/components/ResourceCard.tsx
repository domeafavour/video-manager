import { ResourceThumbnail } from "@/components/ResourceThumbnail";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import {
  VmChip,
  VmGlassIconButton,
  VmGlassToolbar,
  VmTitle,
} from "@/components/ui/vm";
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
        "group relative cursor-move overflow-hidden rounded-[28px] border border-[rgba(214,174,102,0.12)] bg-[rgba(17,19,23,0.88)] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(214,174,102,0.28)] hover:shadow-[0_22px_40px_rgba(0,0,0,0.28)]",
        isHighlighted &&
          "border-[rgba(214,174,102,0.34)] ring-2 ring-[rgba(214,174,102,0.38)] ring-offset-2 ring-offset-[#17191f]",
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelection(material.id);
        }}
        className={cn(
          "absolute left-3 top-3 z-20 flex size-6 items-center justify-center rounded-md border backdrop-blur-sm transition-colors",
          isSelected
            ? "border-[rgba(214,174,102,0.5)] bg-[rgba(214,174,102,0.22)] text-[#f5dec0]"
            : "border-[rgba(214,174,102,0.18)] bg-[rgba(15,16,20,0.72)] text-transparent hover:bg-[rgba(255,255,255,0.08)]",
        )}
        aria-label={isSelected ? "Deselect resource" : "Select resource"}
        title={isSelected ? "Deselect resource" : "Select resource"}
      >
        <CheckIcon className="size-4" />
      </button>

      <div className="relative overflow-hidden border-b border-[rgba(214,174,102,0.08)] bg-[#0f1014]">
        <ResourceThumbnail
          path={material.path}
          className="h-40 w-full rounded-none border-0 bg-[#d7d8dd] transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/46 via-black/8 to-black/28" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(214,174,102,0.08)_0%,rgba(214,174,102,0)_42%)]" />

        <ButtonGroup>
          <VmGlassToolbar className="absolute right-3 top-3 flex gap-1">
          {(isImage(material.path) || isVideo(material.path)) && (
            <PreviewResource resource={material}>
              <VmGlassIconButton
                variant="secondary"
                size="icon-sm"
              >
                <EyeIcon className="size-3.5" />
              </VmGlassIconButton>
            </PreviewResource>
          )}

          <EditResourceTags
            resourceId={material.id}
            tags={material.tags}
            allProjectTags={allProjectTags}
          >
            <VmGlassIconButton
              variant="secondary"
              size="icon-sm"
            >
              <Tags className="size-3.5" />
            </VmGlassIconButton>
          </EditResourceTags>

          <DeleteResource resourceId={material.id} resourcePath={material.path}>
            <VmGlassIconButton
              tone="danger"
              variant="secondary"
              size="icon-sm"
            >
              <Trash className="size-3.5" />
            </VmGlassIconButton>
          </DeleteResource>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <VmGlassIconButton
                variant="secondary"
                size="icon-sm"
                aria-label="More Options"
              >
                <MoreHorizontalIcon className="size-3.5" />
              </VmGlassIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-56 rounded-2xl border-[rgba(214,174,102,0.16)] bg-[rgba(17,19,23,0.96)] p-1.5 text-[#ddd7cb] shadow-[0_24px_50px_rgba(0,0,0,0.3)] backdrop-blur-md"
            >
              <DropdownMenuItem
                className="rounded-xl px-3 py-2 text-[#cfc5b5] focus:bg-[rgba(255,255,255,0.06)] focus:text-[#f5dec0]"
                onClick={() => handleOpenFolder(material.path)}
              >
                <FolderIcon />
                Open containing folder
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-3 py-2 text-[#cfc5b5] focus:bg-[rgba(255,255,255,0.06)] focus:text-[#f5dec0]"
                onClick={() => handleCopyPath(material.path)}
              >
                <CopyIcon />
                Copy Path
              </DropdownMenuItem>
              {material.status === "used" ? (
                <DropdownMenuItem
                  className="rounded-xl px-3 py-2 text-[#cfc5b5] focus:bg-[rgba(255,255,255,0.06)] focus:text-[#f5dec0]"
                  onClick={() => onSetStatus(material.id, "unused")}
                >
                  <XIcon />
                  Mark as Unused
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="rounded-xl px-3 py-2 text-[#cfc5b5] focus:bg-[rgba(255,255,255,0.06)] focus:text-[#f5dec0]"
                  onClick={() => onSetStatus(material.id, "used")}
                >
                  <CheckIcon />
                  Mark as Used
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          </VmGlassToolbar>
        </ButtonGroup>

        <div
          className={cn(
            "absolute bottom-3 left-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm",
            material.status === "used"
              ? "border-emerald-300/20 bg-emerald-500/18 text-emerald-100"
              : "border-[rgba(214,174,102,0.18)] bg-[rgba(15,16,20,0.72)] text-[#b0a79b]",
          )}
        >
          {material.status === "used" ? "Used" : "Unused"}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <VmTitle
          className="truncate text-[17px] font-semibold leading-tight"
          title={material.name}
        >
          {material.name}
        </VmTitle>
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#9d937f]">
          <span className="uppercase tracking-[0.14em] text-[#7f776a]">
            File Size
          </span>
          <span className="font-medium text-[#cfc5b5]">{formatBytes(material.size)}</span>
        </div>
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {material.tags.slice(0, 4).map((tag) => {
              const isTime = isTimeTag(tag);
              return (
                <VmChip
                  key={tag}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-medium leading-none",
                    isTime
                      ? "border-[rgba(196,181,253,0.18)] bg-[rgba(124,58,237,0.14)] text-[#d7c8ff]"
                      : "border-[rgba(214,174,102,0.18)] bg-[rgba(214,174,102,0.1)] text-[#d6b277]",
                  )}
                >
                  {tag}
                </VmChip>
              );
            })}
            {material.tags.length > 4 && (
              <VmChip className="rounded-full border-[rgba(214,174,102,0.16)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1 text-[10px] font-medium leading-none text-[#9d937f]">
                +{material.tags.length - 4}
              </VmChip>
            )}
          </div>
        )}
      </div>
    </ResponsiveGrid.Item>
  );
}
