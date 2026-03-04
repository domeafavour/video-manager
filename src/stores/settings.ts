import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export type ProjectListType = "grid" | "list";

const useSettings = create(
  persist(
    combine(
      {
        projectListType: "grid" as ProjectListType,
        searchQuery: "",
        activeProjectId: null as string | null,
      },
      (set) => ({
        setProjectListType: (type: ProjectListType) =>
          set({ projectListType: type }),
        setSearchQuery: (query: string) =>
          set({ searchQuery: query }),
        setActiveProjectId: (id: string | null) =>
          set({ activeProjectId: id }),
      })
    ),
    {
      name: "settings-storage",
    }
  )
);

export function useProjectListType() {
  return useSettings((state) => state.projectListType);
}

export function setProjectListType(type: ProjectListType) {
  useSettings.getState().setProjectListType(type);
}

export function toggleProjectListType() {
  const current = useSettings.getState().projectListType;
  useSettings.getState().setProjectListType(current === "grid" ? "list" : "grid");
}

export function useSearchQuery() {
  return useSettings((state) => state.searchQuery);
}

export function setSearchQuery(query: string) {
  useSettings.getState().setSearchQuery(query);
}

export function getActiveProjectId(): string | null {
  return useSettings.getState().activeProjectId;
}

export function setActiveProjectId(id: string | null) {
  useSettings.getState().setActiveProjectId(id);
}
