import * as React from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  Pen,
  GripVertical,
} from "lucide-react";
import { type Category } from "@/types/api";
import { cn } from "@/utils/cn";

export type CategoryNodeProps = {
  category: Category;
  level?: number;
  selectedId?: number | null;
  expandedIds?: Set<number>;
  searchQuery?: string;
  onSelect?: (category: Category) => void;
  onToggleExpand?: (id: number) => void;
  onEditCategory?: (category: Category) => void;
  onAddSubCategory?: (parentCategory: Category) => void;
};

export type CategoryListNodeProps = {
  categories: Category[];
  level?: number;
  selectedId?: number | null;
  expandedIds?: Set<number>;
  searchQuery?: string;
  onSelect?: (category: Category) => void;
  onToggleExpand?: (id: number) => void;
  onEditCategory?: (category: Category) => void;
  onAddSubCategory?: (parentCategory: Category) => void;
};

/**
 * Helper component để highlight từ khóa tìm kiếm trong tên danh mục
 */
export const HighlightText = ({
  text,
  query,
}: {
  text: string;
  query?: string;
}) => {
  if (!query || !query.trim()) {
    return <>{text}</>;
  }

  const cleanQuery = query.trim().toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(cleanQuery);

  if (index === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + cleanQuery.length);
  const after = text.slice(index + cleanQuery.length);

  return (
    <>
      {before}
      <mark className="bg-amber-200/90 text-amber-950 font-semibold px-0.5 rounded-xs">
        {match}
      </mark>
      <HighlightText text={after} query={query} />
    </>
  );
};

export const CategoryNode = React.memo(
  ({
    category,
    level = 0,
    selectedId,
    expandedIds,
    searchQuery,
    onSelect,
    onToggleExpand,
    onEditCategory,
    onAddSubCategory,
  }: CategoryNodeProps) => {
    const isControlled = expandedIds !== undefined;
    const isOpen = isControlled
      ? expandedIds.has(category.id)
      : (category.isOpen ?? true);

    const isSelected = selectedId === category.id;
    const hasChildren =
      Array.isArray(category.children) && category.children.length > 0;
    const depth = category.depth ?? level;
    const isRoot = depth === 0;

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand?.(category.id);
    };

    const handleSelect = () => {
      onSelect?.(category);
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEditCategory?.(category);
    };

    const handleAddSub = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddSubCategory?.(category);
    };

    return (
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-selected={isSelected}
        className="relative group/node select-none"
      >
        <div
          tabIndex={0}
          onClick={handleSelect}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleSelect();
            } else if (e.key === "ArrowRight" && hasChildren && !isOpen) {
              e.preventDefault();
              onToggleExpand?.(category.id);
            } else if (e.key === "ArrowLeft" && hasChildren && isOpen) {
              e.preventDefault();
              onToggleExpand?.(category.id);
            }
          }}
          className={cn(
            "group flex items-center justify-between transition-all cursor-pointer rounded-lg border outline-none",
            isRoot
              ? "p-2 sm:p-2.5 font-medium"
              : "p-1.5 sm:p-2 text-xs",
            isSelected
              ? "bg-emerald-50/90 border-emerald-300 shadow-2xs text-emerald-950"
              : "border-transparent hover:bg-slate-100/70 text-slate-700 hover:text-slate-900",
          )}
        >
          {/* Left section: Drag handle, Toggle Chevron, Folder Icon, Name, Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            {/* Grip handle for drag reordering */}
            <span
              className={cn(
                "cursor-grab transition-opacity flex-shrink-0 hidden sm:inline-flex",
                isSelected
                  ? "text-emerald-500 opacity-80"
                  : "text-slate-300 group-hover:text-slate-500 opacity-0 group-hover:opacity-100",
              )}
              title="Kéo thả sắp xếp vị trí"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </span>

            {/* Expand / Collapse Button */}
            {hasChildren ? (
              <button
                type="button"
                aria-label={isOpen ? "Thu gọn danh mục" : "Mở rộng danh mục"}
                onClick={handleToggle}
                className={cn(
                  "p-0.5 rounded-md transition-colors cursor-pointer flex-shrink-0",
                  isSelected
                    ? "text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60",
                )}
              >
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 ease-in-out",
                    isOpen && "rotate-90",
                  )}
                />
              </button>
            ) : (
              <span className="w-4 h-4 flex-shrink-0" />
            )}

            {/* Folder Icon (Differentiates Open vs Closed & Root vs Leaf) */}
            <span
              className={cn(
                "flex-shrink-0 transition-colors",
                isSelected
                  ? "text-emerald-600"
                  : isRoot
                    ? "text-amber-500"
                    : hasChildren
                      ? "text-slate-400 group-hover:text-slate-600"
                      : "text-slate-400",
              )}
            >
              {hasChildren && isOpen ? (
                <FolderOpen className={isRoot ? "w-4 h-4" : "w-3.5 h-3.5"} />
              ) : (
                <Folder className={isRoot ? "w-4 h-4" : "w-3.5 h-3.5"} />
              )}
            </span>

            {/* Category Name with Search Query Highlighting */}
            <span
              className={cn(
                "truncate tracking-tight",
                isSelected
                  ? "font-bold text-emerald-950"
                  : isRoot
                    ? "font-semibold text-slate-900"
                    : "font-normal text-slate-700 group-hover:text-slate-900",
              )}
            >
              <HighlightText text={category.name} query={searchQuery} />
            </span>

            {/* Subcategories Count Badge */}
            {hasChildren && (
              <span
                className={cn(
                  "inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold transition-colors flex-shrink-0",
                  isSelected
                    ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200/80 group-hover:bg-white group-hover:text-slate-700",
                )}
                title={`${category.children.length} danh mục con`}
              >
                {category.children.length}
              </span>
            )}

            {/* Slug tag (shown on wider screens) */}
            {category.slug && (
              <span
                className="hidden xl:inline-block font-mono text-[10px] text-slate-400 bg-slate-50/80 px-1.5 py-0.2 rounded border border-slate-200/60 max-w-[120px] truncate"
                title={`Slug: ${category.slug}`}
              >
                /{category.slug}
              </span>
            )}

            {/* Depth Badge */}
            <span
              className={cn(
                "hidden md:inline-flex items-center text-[9px] px-1.5 py-0.2 rounded font-medium flex-shrink-0",
                isRoot
                  ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                  : "bg-slate-50 text-slate-400 border border-slate-200/60",
              )}
            >
              {isRoot ? "Gốc" : `Cấp ${depth}`}
            </span>
          </div>

          {/* Right section: Action Buttons & Selected Indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {/* Quick Action Buttons: Only renders lightweight buttons instead of heavy FormDrawers */}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleAddSub}
                title={`Thêm danh mục con cho "${category.name}"`}
                className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleEdit}
                title={`Chỉnh sửa "${category.name}"`}
                className="p-1 rounded-md text-slate-400 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
              >
                <Pen className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selected Indicator Pill */}
            {isSelected && (
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"
                title="Đang chọn"
              />
            )}
          </div>
        </div>

        {/* Recursive Children Subtree with branch guide line */}
        {hasChildren && isOpen && (
          <div
            role="group"
            className={cn(
              "relative ml-3.5 sm:ml-4 pl-3.5 border-l-2 space-y-1 mt-1 transition-colors",
              isSelected ? "border-emerald-200" : "border-slate-200/80 hover:border-slate-300",
            )}
          >
            <CategoryListNode
              categories={category.children}
              level={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              searchQuery={searchQuery}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onEditCategory={onEditCategory}
              onAddSubCategory={onAddSubCategory}
            />
          </div>
        )}
      </div>
    );
  },
);

CategoryNode.displayName = "CategoryNode";

export const CategoryListNode = React.memo(
  ({
    categories,
    level = 0,
    selectedId,
    expandedIds,
    searchQuery,
    onSelect,
    onToggleExpand,
    onEditCategory,
    onAddSubCategory,
  }: CategoryListNodeProps) => {
    if (!categories || categories.length === 0) return null;

    return (
      <>
        {categories.map((category) => (
          <div key={category.id} className="relative group/branch">
            {/* L-Shape branch horizontal connector tick for nested items */}
            {level > 0 && (
              <span
                className="absolute -left-3.5 top-4 w-3 h-[2px] bg-slate-200/80 group-hover/branch:bg-slate-400 transition-colors pointer-events-none"
                aria-hidden="true"
              />
            )}
            <CategoryNode
              category={category}
              level={level}
              selectedId={selectedId}
              expandedIds={expandedIds}
              searchQuery={searchQuery}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onEditCategory={onEditCategory}
              onAddSubCategory={onAddSubCategory}
            />
          </div>
        ))}
      </>
    );
  },
);

CategoryListNode.displayName = "CategoryListNode";
