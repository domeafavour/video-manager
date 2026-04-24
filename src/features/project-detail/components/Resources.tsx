import { ButtonGroup } from "@/components/ui/button-group";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import {
  VmButton,
  VmChip,
  VmEmptyState,
  VmEyebrow,
  VmTitle,
} from "@/components/ui/vm";
import { db } from "@/lib/db";
import { dragState } from "@/lib/drag-state";
import { cn } from "@/lib/utils";
import { resources } from "@/services/resources";
import { useMemo, useState } from "react";
import { ResourceCard } from "./ResourceCard";
import { SelectionToolbar } from "./SelectionToolbar";

interface Props {
  projectId: string | number;
}

export type ResourcesProps = Props;

type StatusFilter = "all" | "used" | "unused";

export function Resources({ projectId }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<number[]>([]);
  const [highlightedResourceId, setHighlightedResourceId] = useState<number | null>(null);
  const { data: materials } = resources.list.useQuery({ variables: projectId });

  const allProjectTags = useMemo(
    () =>
      Array.from(new Set(materials?.flatMap((m) => m.tags ?? []) ?? [])).sort(),
    [materials],
  );

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const selectedResourceIdSet = useMemo(
    () => new Set(selectedResourceIds),
    [selectedResourceIds],
  );

  const filteredMaterials = useMemo(
    () =>
      materials?.filter((material) => {
        if (statusFilter !== "all" && material.status !== statusFilter) {
          return false;
        }
        if (selectedTags.length > 0) {
          return selectedTags.every((tag) => material.tags?.includes(tag));
        }
        return true;
      }),
    [materials, selectedTags, statusFilter],
  );

  const selectedResources = useMemo(
    () =>
      materials?.filter((material) => selectedResourceIdSet.has(material.id)) ??
      [],
    [materials, selectedResourceIdSet],
  );

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

  const highlightResource = (resourceId: number) => {
    setHighlightedResourceId(resourceId);
  };

  const handleResourceDragStart = (
    resourcePath: string,
    resourceId: number,
  ) => {
    const isDraggingFromSelection = selectedResourceIdSet.has(resourceId);
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
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <ButtonGroup className="rounded-2xl border border-[rgba(214,174,102,0.12)] bg-[rgba(19,21,26,0.82)] p-1 shadow-none">
          <VmButton
            tone={statusFilter === "all" ? "gold" : "muted"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-xl border-0 shadow-none",
              statusFilter === "all"
                ? "bg-[rgba(214,174,102,0.18)] text-[#f1d6a0] hover:bg-[rgba(214,174,102,0.24)]"
                : "bg-transparent text-[#9d937f] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e7dece]",
            )}
          >
            All
          </VmButton>
          <VmButton
            tone={statusFilter === "used" ? "gold" : "muted"}
            size="sm"
            onClick={() => setStatusFilter("used")}
            className={cn(
              "rounded-xl border-0 shadow-none",
              statusFilter === "used"
                ? "bg-[rgba(214,174,102,0.18)] text-[#f1d6a0] hover:bg-[rgba(214,174,102,0.24)]"
                : "bg-transparent text-[#9d937f] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e7dece]",
            )}
          >
            Used
          </VmButton>
          <VmButton
            tone={statusFilter === "unused" ? "gold" : "muted"}
            size="sm"
            onClick={() => setStatusFilter("unused")}
            className={cn(
              "rounded-xl border-0 shadow-none",
              statusFilter === "unused"
                ? "bg-[rgba(214,174,102,0.18)] text-[#f1d6a0] hover:bg-[rgba(214,174,102,0.24)]"
                : "bg-transparent text-[#9d937f] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e7dece]",
            )}
          >
            Unused
          </VmButton>
        </ButtonGroup>
        {allProjectTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {allProjectTags.map((tag) => (
              <VmChip
                as="button"
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  selectedTags.includes(tag)
                    ? "border-[rgba(214,174,102,0.28)] bg-[rgba(214,174,102,0.16)] text-[#f1d6a0]"
                    : "border-[rgba(214,174,102,0.16)] bg-[rgba(255,255,255,0.03)] text-[#b8ae9c] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eee6d8]",
                )}
              >
                {tag}
              </VmChip>
            ))}
            {selectedTags.length > 0 && (
              <VmChip
                as="button"
                onClick={() => setSelectedTags([])}
                className="rounded-full border-[rgba(214,174,102,0.14)] bg-[rgba(255,255,255,0.02)] px-2.5 py-1 text-xs text-[#8d8578] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e7dece]"
              >
                Clear
              </VmChip>
            )}
          </div>
        )}
      </div>

      <SelectionToolbar
        selectedResourceCount={selectedResourceCount}
        onDragStart={handleSelectedResourcesDragStart}
        onDragEnd={handleInternalDragEnd}
        onClear={clearResourceSelection}
      />

      <ResponsiveGrid>
        {filteredMaterials?.map((material) => (
          <ResourceCard
            key={material.id}
            material={material}
            isSelected={selectedResourceIdSet.has(material.id)}
            isHighlighted={highlightedResourceId === material.id}
            allProjectTags={allProjectTags}
            onToggleSelection={toggleResourceSelection}
            onDragStart={handleResourceDragStart}
            onDragEnd={handleInternalDragEnd}
            onHighlight={highlightResource}
          />
        ))}
        {!filteredMaterials?.length && (
          <VmEmptyState className="col-span-full text-[#9d937f]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(214,174,102,0.18)] bg-[rgba(214,174,102,0.08)] text-2xl shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
              📁
            </div>
            <VmEyebrow className="text-[#8d8578]">
              Library
            </VmEyebrow>
            <VmTitle className="mt-2 text-[22px] font-semibold text-[#e7dece]">
              {materials?.length
                ? "No materials match the selected filter"
                : "No materials yet"}
            </VmTitle>
            <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8d8578]">
              {materials?.length
                ? "Try selecting a different filter or clearing tag filters"
                : "Drag and drop files here to get started"}
            </div>
          </VmEmptyState>
        )}
      </ResponsiveGrid>
    </>
  );
}
