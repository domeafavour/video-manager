import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export type ProjectListType = "grid" | "list";

const useSettings = create(
  persist(
    combine(
      {
        projectListType: "grid" as ProjectListType,
      },
      (set) => ({
        setProjectListType: (type: ProjectListType) =>
          set({ projectListType: type }),
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
