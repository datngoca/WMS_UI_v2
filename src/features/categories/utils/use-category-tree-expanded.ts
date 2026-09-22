import * as React from "react";
import type { Category } from "@/types/api";
import { useUpdateCategoryOpen } from "../api/update-category-open";

export const CATEGORY_TREE_EXPANDED_STORAGE_KEY =
  "wms_category_tree_expanded_ids";

export const loadSavedExpandedIds = (): Set<number> | null => {
  try {
    const saved = localStorage.getItem(CATEGORY_TREE_EXPANDED_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map(Number));
      }
    }
  } catch {
    // ignore if localStorage is unavailable
  }
  return null;
};

export const saveExpandedIdsToStorage = (ids: Set<number>) => {
  try {
    localStorage.setItem(
      CATEGORY_TREE_EXPANDED_STORAGE_KEY,
      JSON.stringify(Array.from(ids)),
    );
  } catch {
    // ignore
  }
};

export const getAllCategoryIds = (categories: Category[]): number[] => {
  let ids: number[] = [];
  for (const cat of categories) {
    ids.push(cat.id);
    if (cat.children && cat.children.length > 0) {
      ids = ids.concat(getAllCategoryIds(cat.children));
    }
  }
  return ids;
};

export const getInitialExpandedIds = (categories: Category[]): Set<number> => {
  const ids = new Set<number>();
  const traverse = (cats: Category[]) => {
    for (const cat of cats) {
      if (
        cat.isOpen === true ||
        ((cat.depth === 0 || cat.depth === undefined) &&
          cat.children &&
          cat.children.length > 0)
      ) {
        ids.add(cat.id);
      }
      if (cat.children && cat.children.length > 0) {
        traverse(cat.children);
      }
    }
  };
  traverse(categories);
  return ids.size > 0 ? ids : new Set(getAllCategoryIds(categories));
};

export const useCategoryTreeExpanded = (categories: Category[] = []) => {
  const updateCategoryOpenMutation = useUpdateCategoryOpen();

  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(() => {
    const saved = loadSavedExpandedIds();
    if (saved !== null) {
      return saved;
    }
    return getInitialExpandedIds(categories);
  });

  const [prevData, setPrevData] = React.useState(categories);
  if (prevData !== categories) {
    setPrevData(categories);
    const saved = loadSavedExpandedIds();
    if (saved === null && expandedIds.size === 0 && categories.length > 0) {
      const initial = getInitialExpandedIds(categories);
      setExpandedIds(initial);
      saveExpandedIdsToStorage(initial);
    }
  }

  const expandedIdsRef = React.useRef(expandedIds);
  expandedIdsRef.current = expandedIds;

  const debounceTimersRef = React.useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  React.useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const handleToggleExpand = React.useCallback(
    (id: number) => {
      const current = expandedIdsRef.current;
      const isCurrentlyOpen = current.has(id);
      const newIsOpen = !isCurrentlyOpen;

      const next = new Set(current);
      if (isCurrentlyOpen) {
        next.delete(id);
      } else {
        next.add(id);
      }

      expandedIdsRef.current = next;
      // 1. Cập nhật state UI tức thì
      setExpandedIds(next);

      // 2. Lưu LocalStorage ngay lập tức
      saveExpandedIdsToStorage(next);

      // 3. Debounce đồng bộ API backend (250ms) để tránh spam request / lock conflict khi click nhanh
      const existingTimer = debounceTimersRef.current.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        debounceTimersRef.current.delete(id);
        updateCategoryOpenMutation.mutate({
          categoryId: id,
          isOpen: newIsOpen,
        });
      }, 250);

      debounceTimersRef.current.set(id, timer);
    },
    [updateCategoryOpenMutation],
  );

  const handleExpandAll = React.useCallback(() => {
    const allIds = new Set(getAllCategoryIds(categories));
    setExpandedIds(allIds);
    saveExpandedIdsToStorage(allIds);
  }, [categories]);

  const handleCollapseAll = React.useCallback(() => {
    const empty = new Set<number>();
    setExpandedIds(empty);
    saveExpandedIdsToStorage(empty);
  }, []);

  return {
    expandedIds,
    setExpandedIds,
    handleToggleExpand,
    handleExpandAll,
    handleCollapseAll,
  };
};
