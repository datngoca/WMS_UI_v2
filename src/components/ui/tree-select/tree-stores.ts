import { create } from "zustand";
import type { TreeNodeDataState } from "./types";

type TreeSelectStore = {
  onCheck: (node: TreeNodeDataState) => void;
  setOnCheck: (onCheck: (node: TreeNodeDataState) => void) => void;
};

export const useTreeSelect = create<TreeSelectStore>((set) => ({
  onCheck: () => {},
  setOnCheck: (onCheck) => set({ onCheck }),
}));
