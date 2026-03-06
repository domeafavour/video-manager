import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
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
            allProjectTags={allProjectTags}
            onToggleSelection={toggleResourceSelection}
            onDragStart={handleResourceDragStart}
            onDragEnd={handleInternalDragEnd}
          />
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
