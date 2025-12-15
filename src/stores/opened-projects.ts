import { create } from "zustand";
import { combine } from "zustand/middleware";

const useOpenedProjects = create(
  combine({ ids: [] as string[] }, (set) => ({
    setIds: (ids: string[] | ((prev: string[]) => string[])) =>
      set((prev) => ({
        ids: typeof ids === "function" ? ids(prev.ids) : ids,
      })),
  }))
);

export function useOpenedIds() {
  return useOpenedProjects((state) => state.ids);
}

export function addOpenedId(idToAdd: string | number) {
  const stringId = idToAdd + "";
  useOpenedProjects.getState().setIds((prev) => {
    if (!prev.includes(stringId)) {
      return [stringId, ...prev];
    }
    return prev;
  });
}

export function deleteOpenedId(idToDelete: string | number) {
  useOpenedProjects
    .getState()
    .setIds((prev) => prev.filter((id) => id !== idToDelete + ""));
}
