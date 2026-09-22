import type { TreeNodeData } from "@/components/ui/tree-select";
import type { Category } from "@/types/api";

/**
 * Hàm đệ quy chuyển đổi danh sách Category (dạng cây) sang TreeNodeData[] dùng cho TreeSelect.
 *
 * @param items Danh sách danh mục Category[]
 * @param excludeId ID danh mục cần loại trừ (ví dụ: không cho phép chọn chính nó làm cha khi cập nhật)
 * @returns Danh sách TreeNodeData[]
 */
export const transformCategoriesToTreeData = (
  items: Category[] = [],
  excludeId?: number,
): TreeNodeData[] => {
  return items
    .filter((cat) => cat.id !== excludeId) // Không cho phép chọn chính nó làm cha
    .map((cat) => ({
      name: cat.name,
      value: String(cat.id), // TreeNodeData yêu cầu value là string
      children:
        cat.children && cat.children.length > 0
          ? transformCategoriesToTreeData(cat.children, excludeId)
          : undefined,
    }));
};
