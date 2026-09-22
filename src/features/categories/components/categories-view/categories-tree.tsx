import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  FolderTree,
  Plus,
  Search,
  X,
} from "lucide-react";
import { type Category } from "@/types/api";
import { Button } from "@/components/ui/button";
import { CategoryListNode } from "./categories-node";
import { CreateCategory } from "../create-category";
import { UpdateCategory } from "../update-category";
import {
  getAllCategoryIds,
  useCategoryTreeExpanded,
} from "../../utils/use-category-tree-expanded";

const countCategories = (categories: Category[]): number => {
  let count = 0;
  const traverse = (cats: Category[]) => {
    for (const cat of cats) {
      count += 1;
      if (cat.children && cat.children.length > 0) {
        traverse(cat.children);
      }
    }
  };
  traverse(categories);
  return count;
};

const filterCategoryTree = (
  categories: Category[],
  query: string,
): Category[] => {
  if (!query.trim()) return categories;
  const lowerQuery = query.toLowerCase().trim();

  const filterNode = (node: Category): Category | null => {
    const isSelfMatch =
      node.name.toLowerCase().includes(lowerQuery) ||
      (node.slug && node.slug.toLowerCase().includes(lowerQuery));

    let filteredChildren: Category[] = [];
    if (node.children && node.children.length > 0) {
      filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is Category => child !== null);
    }

    if (isSelfMatch || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  };

  return categories
    .map(filterNode)
    .filter((node): node is Category => node !== null);
};

export type CategoriesListTreeProps = {
  data: Category[];
  selectedCategory?: Category | null;
  expandedIds?: Set<number>;
  onToggleExpand?: (id: number) => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onSelectCategory?: (category: Category) => void;
  onEditCategory?: (category: Category) => void;
  onAddCategory?: (parentCategory?: Category) => void;
};

export const CategoriesListTree = ({
  data,
  selectedCategory,
  expandedIds: controlledExpandedIds,
  onToggleExpand,
  onExpandAll,
  onCollapseAll,
  onSelectCategory,
  onEditCategory,
  onAddCategory,
}: CategoriesListTreeProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Internal expansion hook used if not controlled from parent
  const internalExpansion = useCategoryTreeExpanded(data);

  const activeExpandedIds = controlledExpandedIds ?? internalExpansion.expandedIds;
  const handleToggle = onToggleExpand ?? internalExpansion.handleToggleExpand;
  const handleExpandAllAction = onExpandAll ?? internalExpansion.handleExpandAll;
  const handleCollapseAllAction = onCollapseAll ?? internalExpansion.handleCollapseAll;

  // Shared single modal drawer states (lifts state to prevent mounting 100+ drawers)
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null,
  );
  const [creatingForParent, setCreatingForParent] = React.useState<
    { id: number; name: string } | null | undefined
  >(undefined);

  // Filtered tree data based on search input
  const filteredData = React.useMemo(() => {
    return filterCategoryTree(data, searchQuery);
  }, [data, searchQuery]);

  const totalCategoriesCount = React.useMemo(() => countCategories(data), [data]);
  const filteredCount = React.useMemo(
    () => countCategories(filteredData),
    [filteredData],
  );

  // When searching, auto-expand all matching branches directly in render without useEffect
  const isSearching = Boolean(searchQuery.trim());
  const effectiveExpandedIds = React.useMemo(() => {
    if (isSearching) {
      return new Set(getAllCategoryIds(filteredData));
    }
    return activeExpandedIds;
  }, [isSearching, filteredData, activeExpandedIds]);

  const handleOpenEdit = React.useCallback(
    (category: Category) => {
      if (onEditCategory) {
        onEditCategory(category);
      } else {
        setEditingCategory(category);
      }
    },
    [onEditCategory],
  );

  const handleOpenAddSub = React.useCallback(
    (parentCategory: Category) => {
      if (onAddCategory) {
        onAddCategory(parentCategory);
      } else {
        setCreatingForParent({
          id: parentCategory.id,
          name: parentCategory.name,
        });
      }
    },
    [onAddCategory],
  );

  return (
    <section
      className="flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden min-h-0 flex-1 h-full"
      data-purpose="tree-hierarchy-panel"
      role="tree"
    >
      {/* Header & Controls */}
      <div className="p-3 sm:p-4 border-b border-slate-100 bg-white flex-shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Cây Danh Mục
                </h2>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {totalCategoriesCount} mục
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Phân cấp đa tầng ngành hàng & sản phẩm
              </p>
            </div>
          </div>

          {/* Expand / Collapse all buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExpandAllAction}
              className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-md text-[11px] font-medium border border-slate-200/80 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Mở rộng toàn bộ cây"
              type="button"
            >
              <ChevronDown className="w-3 h-3 text-slate-500" />
              <span>Mở rộng</span>
            </button>
            <button
              onClick={handleCollapseAllAction}
              className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-md text-[11px] font-medium border border-slate-200/80 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Thu gọn toàn bộ cây"
              type="button"
            >
              <ChevronUp className="w-3 h-3 text-slate-500" />
              <span>Thu gọn</span>
            </button>
          </div>
        </div>

        {/* Search & Quick Filter bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
            className="w-full pl-8 pr-8 py-1.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search result indicator */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
            <span>
              Tìm thấy <strong className="text-emerald-700">{filteredCount}</strong> kết quả phù hợp
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-emerald-700 hover:underline cursor-pointer"
            >
              Đặt lại
            </button>
          </div>
        )}
      </div>

      {/* Tree Node List Container */}
      <div
        className="flex-1 overflow-y-auto p-2.5 sm:p-3 text-xs space-y-0.5 min-h-0"
        data-purpose="tree-nodes-list"
      >
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <FolderTree className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            <p>
              {searchQuery.trim()
                ? `Không tìm thấy danh mục nào phù hợp với "${searchQuery}"`
                : "Chưa có danh mục nào trong hệ thống"}
            </p>
            {searchQuery.trim() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-1 text-xs"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <CategoryListNode
            categories={filteredData}
            selectedId={selectedCategory?.id}
            expandedIds={effectiveExpandedIds}
            searchQuery={searchQuery}
            onSelect={onSelectCategory}
            onToggleExpand={handleToggle}
            onEditCategory={handleOpenEdit}
            onAddSubCategory={handleOpenAddSub}
          />
        )}
      </div>

      {/* Footer: Create Root Category & Drag hint */}
      <div className="p-2.5 sm:p-3 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between flex-shrink-0">
        <Button
          size="sm"
          icon={<Plus className="size-4" />}
          onClick={() => {
            if (onAddCategory) {
              onAddCategory(undefined);
            } else {
              setCreatingForParent(null);
            }
          }}
          className="cursor-pointer font-medium"
        >
          Thêm danh mục gốc
        </Button>

        <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1 font-normal">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          Kéo thả để sắp xếp vị trí
        </span>
      </div>

      {/* Controlled Shared Update Drawer (Only mounted and rendered on demand!) */}
      {editingCategory && (
        <UpdateCategory
          categoryId={editingCategory.id}
          initialCategory={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => {
            if (!open) setEditingCategory(null);
          }}
          triggerButton={null}
        />
      )}

      {/* Controlled Shared Create Drawer (Only mounted and rendered on demand!) */}
      {creatingForParent !== undefined && (
        <CreateCategory
          parent={creatingForParent}
          open={creatingForParent !== undefined}
          onOpenChange={(open) => {
            if (!open) setCreatingForParent(undefined);
          }}
          triggerButton={null}
        />
      )}
    </section>
  );
};
