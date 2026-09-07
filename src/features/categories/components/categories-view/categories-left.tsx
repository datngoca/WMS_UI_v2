import * as React from "react";
import { type Category } from "@/types/api";
import { CategoryListNode } from "./categories-node";
import { CreateCategory } from "../create-category";

const getAllCategoryIds = (categories: Category[]): number[] => {
  let ids: number[] = [];
  for (const cat of categories) {
    ids.push(cat.id);
    if (cat.children && cat.children.length > 0) {
      ids = ids.concat(getAllCategoryIds(cat.children));
    }
  }
  return ids;
};

type CategoriesListTreeProps = {
  data: Category[];
  selectedCategory?: Category | null;
  onSelectCategory?: (category: Category) => void;
  onAddCategory?: (parentCategory?: Category) => void;
};

export const CategoriesListTree = ({
  data,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
}: CategoriesListTreeProps) => {
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(() => {
    return new Set(getAllCategoryIds(data));
  });

  const handleExpandAll = () => {
    setExpandedIds(new Set(getAllCategoryIds(data)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section
      className="col-span-12 lg:col-span-5 flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden h-full"
      data-purpose="tree-hierarchy-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
              Cây Danh Mục Sản Phẩm
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Phân cấp ngành hàng FreshMart
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExpandAll}
              className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md text-[11px] font-medium border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Mở rộng tất cả"
              type="button"
            >
              <svg
                className="w-3 h-3 text-slate-400"
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
              <span>Mở rộng</span>
            </button>
            <button
              onClick={handleCollapseAll}
              className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md text-[11px] font-medium border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Thu gọn tất cả"
              type="button"
            >
              <svg
                className="w-3 h-3 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 15l7-7 7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Thu gọn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tree Node List */}
      <div
        className="flex-1 overflow-y-auto p-3 text-xs divide-y divide-slate-100/60"
        data-purpose="tree-nodes-list"
      >
        {data.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Chưa có danh mục nào
          </div>
        ) : (
          <CategoryListNode
            categories={data}
            selectedId={selectedCategory?.id}
            expandedIds={expandedIds}
            onSelect={onSelectCategory}
            onToggleExpand={handleToggleExpand}
            onAddSubCategory={onAddCategory}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between flex-shrink-0">
        {/* <button
          onClick={() => onAddCategory?.()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-300/80 px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-emerald-50 transition-colors cursor-pointer"
          type="button"
        >
          <svg
            className="w-3.5 h-3.5 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span>Thêm danh mục gốc</span>
        </button> */}
        <CreateCategory />
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-normal">
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
          </svg>{" "}
          Kéo thả để sắp xếp vị trí
        </span>
      </div>
    </section>
  );
};
