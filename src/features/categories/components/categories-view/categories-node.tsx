import * as React from "react";
import { type Category } from "@/types/api";
import { cn } from "@/utils/cn";
import { CreateCategory } from "../create-category";
import { UpdateCategory } from "../update-category";

export type CategoryNodeProps = {
  category: Category;
  level?: number;
  selectedId?: number | null;
  expandedIds?: Set<number>;
  onSelect?: (category: Category) => void;
  onToggleExpand?: (id: number) => void;
  onAddSubCategory?: (parentCategory: Category) => void;
};

export type CategoryListNodeProps = {
  categories: Category[];
  level?: number;
  selectedId?: number | null;
  expandedIds?: Set<number>;
  onSelect?: (category: Category) => void;
  onToggleExpand?: (id: number) => void;
  onAddSubCategory?: (parentCategory: Category) => void;
};

export const CategoryNode = ({
  category,
  level = 0,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onAddSubCategory,
}: CategoryNodeProps) => {
  const [localIsOpen, setLocalIsOpen] = React.useState(true);
  const isControlled = expandedIds !== undefined;
  const isOpen = isControlled ? expandedIds.has(category.id) : localIsOpen;

  const isSelected = selectedId === category.id;
  const hasChildren =
    Array.isArray(category.children) && category.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand(category.id);
    } else {
      setLocalIsOpen((prev) => !prev);
    }
  };

  const handleSelect = () => {
    onSelect?.(category);
  };

  const handleAddSub = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddSubCategory?.(category);
  };

  const isRoot = level === 0;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleSelect();
          }
        }}
        className={cn(
          "group flex items-center justify-between transition-colors cursor-pointer select-none",
          isRoot
            ? "p-2 rounded-lg"
            : level === 1
              ? "p-2 rounded-lg"
              : "p-1.5 rounded-md",
          isSelected
            ? "bg-emerald-50/80 border border-emerald-300 shadow-2xs"
            : "hover:bg-slate-50",
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Drag Handle Icon */}
          <span
            className={cn(
              "cursor-grab transition-colors flex-shrink-0",
              isSelected
                ? "text-emerald-600"
                : "text-slate-300 group-hover:text-slate-400",
            )}
            title="Kéo thả sắp xếp"
          >
            <svg
              className={isRoot ? "w-3.5 h-3.5" : "w-3 h-3"}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 8h16M4 16h16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </span>

          {/* Expand/Collapse Button (for nodes with children) */}
          {hasChildren ? (
            <button
              aria-label={isOpen ? "Thu gọn danh mục" : "Mở rộng danh mục"}
              className={cn(
                "p-0.5 rounded transition-colors cursor-pointer flex-shrink-0",
                isSelected
                  ? "text-emerald-800 hover:text-emerald-950"
                  : "text-slate-600 hover:text-slate-900",
              )}
              onClick={handleToggle}
              type="button"
            >
              <svg
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-150",
                  !isOpen && "-rotate-90",
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          ) : null}

          {/* Folder Icon */}
          <span
            className={cn(
              "flex-shrink-0",
              isSelected
                ? "text-emerald-600"
                : isRoot
                  ? "text-amber-500"
                  : "text-slate-400",
            )}
          >
            <svg
              className={isRoot ? "w-4 h-4" : "w-3.5 h-3.5"}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </span>

          {/* Category Name */}
          <span
            className={cn(
              "truncate",
              isSelected
                ? "font-bold text-emerald-950 text-xs"
                : isRoot
                  ? "font-semibold text-slate-900 text-xs"
                  : "font-medium text-slate-700 text-xs",
            )}
          >
            {category.name}
          </span>
        </div>

        {/* Right Section: Actions / Active Indicator */}
        <div className="flex items-center gap-2 text-[11px] flex-shrink-0">
          {/* Add Subcategory Action Button */}
          {/* <button
            className={cn(
              "p-0.5 rounded transition-opacity cursor-pointer",
              isSelected
                ? "text-emerald-700 hover:text-emerald-900 opacity-100"
                : "text-slate-400 hover:text-emerald-700 opacity-0 group-hover:opacity-100"
            )}
            title="Thêm danh mục con"
            type="button"
            onClick={handleAddSub}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4v16m8-8H4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button> */}
          <UpdateCategory categoryId={category.id} initialCategory={category} />
          <CreateCategory parent={{ id: category.id, name: category.name }} />

          {/* Selected Indicator Dot */}
          {isSelected && (
            <span
              className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"
              title="Đang chọn"
            />
          )}
        </div>
      </div>

      {/* Recursive Children Subtree */}
      {hasChildren && isOpen && (
        <div
          className={cn(
            "ml-5 pl-2.5 border-l space-y-1 mt-1 tree-guide-line",
            isSelected ? "border-emerald-200" : "border-slate-200/90",
          )}
        >
          <CategoryListNode
            categories={category.children}
            level={level + 1}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onSelect={onSelect}
            onToggleExpand={onToggleExpand}
            onAddSubCategory={onAddSubCategory}
          />
        </div>
      )}
    </div>
  );
};

export const CategoryListNode = ({
  categories,
  level = 0,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onAddSubCategory,
}: CategoryListNodeProps) => {
  if (!categories || categories.length === 0) return null;

  return (
    <>
      {categories.map((category) =>
        level === 0 ? (
          <div key={category.id} className="py-1">
            <CategoryNode
              category={category}
              level={level}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddSubCategory={onAddSubCategory}
            />
          </div>
        ) : (
          <div key={category.id} className="tree-branch-leaf">
            <CategoryNode
              category={category}
              level={level}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddSubCategory={onAddSubCategory}
            />
          </div>
        ),
      )}
    </>
  );
};
