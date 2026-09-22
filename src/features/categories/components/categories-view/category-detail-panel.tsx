import {
  Calendar,
  Clock,
  ExternalLink,
  Folder,
  FolderTree,
  GitBranch,
  Layers,
  Pen,
  Plus,
  Tag,
  X,
} from "lucide-react";
import { type Category } from "@/types/api";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export type CategoryDetailPanelProps = {
  category?: Category | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSelectCategory?: (category: Category) => void;
  onEditCategory?: (category: Category) => void;
  onAddSubCategory?: (parentCategory: Category) => void;
  onClose?: () => void;
  className?: string;
};

export const CategoryDetailPanel = ({
  category,
  isExpanded,
  onToggleExpand,
  onSelectCategory,
  onEditCategory,
  onAddSubCategory,
  onClose,
  className,
}: CategoryDetailPanelProps) => {
  if (!category) {
    return (
      <div
        className={cn(
          "h-full flex flex-col items-center justify-center p-6 text-center bg-white rounded-xl border border-slate-200/80 shadow-2xs",
          className,
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
          <FolderTree className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          Chưa chọn danh mục
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
          Nhấp vào bất kỳ danh mục nào ở cây bên trái để xem thông tin chi tiết và thao tác quản lý.
        </p>
      </div>
    );
  }

  const depth = category.depth ?? 0;
  const isRoot = depth === 0;
  const hasChildren =
    Array.isArray(category.children) && category.children.length > 0;

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden min-h-0",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60 flex-shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {category.name}
                </h3>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded font-medium",
                    isRoot
                      ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
                  )}
                >
                  {isRoot ? "Danh mục gốc" : `Cấp độ ${depth}`}
                </span>
              </div>
              {category.slug && (
                <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                  /{category.slug}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                title="Đóng chi tiết"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            icon={<Pen className="w-3.5 h-3.5" />}
            onClick={() => onEditCategory?.(category)}
            className="flex-1 cursor-pointer text-xs"
          >
            Chỉnh sửa
          </Button>
          <Button
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => onAddSubCategory?.(category)}
            className="flex-1 cursor-pointer text-xs"
          >
            Thêm danh mục con
          </Button>
        </div>
      </div>

      {/* Content: Detailed specs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1 font-medium">
              <Tag className="w-3 h-3" /> Mã định danh (ID)
            </span>
            <span className="font-mono font-semibold text-slate-800 text-xs">
              #{category.id}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1 font-medium">
              <Layers className="w-3 h-3" /> Phân cấp
            </span>
            <span className="font-semibold text-slate-800 text-xs">
              {isRoot ? "Gốc (Root)" : `Độ sâu: ${depth}`}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1 font-medium">
              <GitBranch className="w-3 h-3" /> Danh mục cha
            </span>
            <span className="font-semibold text-slate-800 text-xs truncate block" title={category.parent?.name}>
              {category.parent?.name ? category.parent.name : "Không có (Gốc)"}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1 font-medium">
              <FolderTree className="w-3 h-3" /> Danh mục con
            </span>
            <span className="font-semibold text-emerald-700 text-xs">
              {category.children ? category.children.length : 0} mục trực thuộc
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Mô tả danh mục
          </h4>
          <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-100 text-slate-600 leading-relaxed min-h-[60px]">
            {category.description ? (
              <p className="whitespace-pre-wrap">{category.description}</p>
            ) : (
              <p className="text-slate-400 italic">Chưa có mô tả cho danh mục này.</p>
            )}
          </div>
        </div>

        {/* Subcategories preview list */}
        {hasChildren && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Danh mục con trực thuộc ({category.children.length})
              </h4>
              {onToggleExpand && (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  {isExpanded ? "Thu gọn nhánh" : "Mở rộng nhánh"}
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200/70 rounded-lg overflow-hidden bg-white">
              {category.children.map((child) => (
                <div
                  key={child.id}
                  onClick={() => onSelectCategory?.(child)}
                  className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                    <span className="font-medium text-slate-700 group-hover:text-slate-900 truncate">
                      {child.name}
                    </span>
                    {child.children && child.children.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-500 font-semibold">
                        {child.children.length}
                      </span>
                    )}
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata timestamps */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Ngày tạo:
            </span>
            <span className="font-medium text-slate-600">
              {formatDate(category.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Cập nhật lần cuối:
            </span>
            <span className="font-medium text-slate-600">
              {formatDate(category.updateAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
