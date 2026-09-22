import * as React from "react";
import { FolderTree, Info } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCategories } from "../../api/get-categories";
import { CategoriesListTree } from "./categories-tree";
import { CategoryDetailPanel } from "./category-detail-panel";
import { type Category } from "@/types/api";
import { CreateCategory } from "../create-category";
import { UpdateCategory } from "../update-category";
import { cn } from "@/utils/cn";

import { useCategoryTreeExpanded } from "../../utils/use-category-tree-expanded";

export const CategoriesView = () => {
  const categoriesQuery = useCategories({});
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(
    null,
  );
  const [mobileTab, setMobileTab] = React.useState<"tree" | "detail">("tree");

  // Shared single modal drawer states
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null,
  );
  const [creatingForParent, setCreatingForParent] = React.useState<
    { id: number; name: string } | null | undefined
  >(undefined);

  const categories = categoriesQuery.data?.data;

  // Manages open/close state, LocalStorage persistence and backend API syncing
  const {
    expandedIds,
    handleToggleExpand,
    handleExpandAll,
    handleCollapseAll,
  } = useCategoryTreeExpanded(categories);

  // Derives selectedCategory from the latest query data without calling setState in an effect
  const selectedCategory = React.useMemo(() => {
    if (!categories || categories.length === 0) return null;

    const findCategory = (cats: Category[], id: number): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    if (selectedCategoryId !== null) {
      return findCategory(categories, selectedCategoryId) ?? categories[0] ?? null;
    }

    return categories[0] ?? null;
  }, [categories, selectedCategoryId]);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategoryId(category.id);
    // On small screens, automatically switch to detail tab to view info
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileTab("detail");
    }
  };

  if (categoriesQuery.isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!categories) return null;

  return (
    <div className="min-h-0 flex-1 flex flex-col h-full overflow-hidden">
      {/* Mobile Tab Switcher (< 1024px) */}
      <div className="flex lg:hidden items-center p-1 bg-slate-100 rounded-xl mb-2 flex-shrink-0 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setMobileTab("tree")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
            mobileTab === "tree"
              ? "bg-white text-emerald-800 shadow-2xs"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Cây danh mục</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("detail")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
            mobileTab === "detail"
              ? "bg-white text-emerald-800 shadow-2xs"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          <Info className="w-3.5 h-3.5" />
          <span>
            {selectedCategory ? `Chi tiết: ${selectedCategory.name}` : "Chi tiết"}
          </span>
        </button>
      </div>

      {/* Responsive Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-1 min-h-0 h-full overflow-hidden">
        {/* Left Column: Category Tree (7 cols on desktop) */}
        <div
          className={cn(
            "lg:col-span-7 xl:col-span-7 h-full min-h-0 flex flex-col",
            mobileTab === "detail" ? "hidden lg:flex" : "flex",
          )}
        >
          <CategoriesListTree
            data={categories}
            selectedCategory={selectedCategory}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            onSelectCategory={handleSelectCategory}
            onEditCategory={(cat) => setEditingCategory(cat)}
            onAddCategory={(parentCat) => {
              if (parentCat) {
                setCreatingForParent({
                  id: parentCat.id,
                  name: parentCat.name,
                });
              } else {
                setCreatingForParent(null);
              }
            }}
          />
        </div>

        {/* Right Column: Category Details Panel (5 cols on desktop) */}
        <div
          className={cn(
            "lg:col-span-5 xl:col-span-5 h-full min-h-0 flex flex-col",
            mobileTab === "tree" ? "hidden lg:flex" : "flex",
          )}
        >
          <CategoryDetailPanel
            category={selectedCategory}
            isExpanded={
              selectedCategory ? expandedIds.has(selectedCategory.id) : false
            }
            onToggleExpand={() =>
              selectedCategory && handleToggleExpand(selectedCategory.id)
            }
            onSelectCategory={handleSelectCategory}
            onEditCategory={(cat) => setEditingCategory(cat)}
            onAddSubCategory={(parentCat) =>
              setCreatingForParent({
                id: parentCat.id,
                name: parentCat.name,
              })
            }
            onClose={() => {
              setSelectedCategoryId(null);
              setMobileTab("tree");
            }}
          />
        </div>
      </div>

      {/* Controlled Shared Update Drawer (Mounted only when open) */}
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

      {/* Controlled Shared Create Drawer (Mounted only when open) */}
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
    </div>
  );
};
