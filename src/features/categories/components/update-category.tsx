import { Pen } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormDrawer,
  Input,
  Textarea,
  TreeSelect,
} from "@/components/ui/form";
import { useNotifications } from "@/components/ui/notifications";
import type { TreeNodeData } from "@/components/ui/tree-select";
import type { Category } from "@/types/api";

import { useCategories } from "../api/get-categories";
import { useCategory } from "../api/get-category";
import {
  updateCategoryInputSchema,
  useUpdateCategory,
} from "../api/update-category";

// Hàm đệ quy chuyển đổi Category[] sang TreeNodeData[]
const transformCategoriesToTreeData = (
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

type UpdateCategoryProps = {
  categoryId: number;
  initialCategory?: Category;
};

export const UpdateCategory = ({
  categoryId,
  initialCategory,
}: UpdateCategoryProps) => {
  const { addNotification } = useNotifications();

  // Dùng hook lấy danh sách categories (tận dụng cache TanStack Query)
  const categoriesQuery = useCategories({});
  const categories = categoriesQuery.data?.data ?? [];

  // Lấy chi tiết category cần sửa (chỉ fetch nếu chưa có initialCategory)
  const categoryQuery = useCategory({
    categoryId,
    queryConfig: {
      enabled: !initialCategory,
    },
  });
  const category = initialCategory ?? categoryQuery.data?.data;

  const updateCategoryMutation = useUpdateCategory({
    mutationConfig: {
      onSuccess: (res) => {
        addNotification({
          type: "success",
          title: res.message,
        });
      },
    },
  });

  // Chuyển đổi dữ liệu cây danh mục
  const treeData = React.useMemo(() => {
    return transformCategoriesToTreeData(categories, categoryId);
  }, [categories, categoryId]);

  return (
    <FormDrawer
      isDone={updateCategoryMutation.isSuccess}
      triggerButton={
        <Button size="sm">
          <Pen className="size-4" />
        </Button>
      }
      title="Sửa danh mục"
      submitButton={
        <Button
          form="update-category"
          type="submit"
          size="sm"
          isLoading={updateCategoryMutation.isPending}
        >
          Submit
        </Button>
      }
    >
      <Form
        id="update-category"
        onSubmit={(values) => {
          updateCategoryMutation.mutate({
            data: {
              ...values,
              parentId: values.parentId ? Number(values.parentId) : null,
            },
            categoryId,
          });
        }}
        options={{
          defaultValues: {
            name: category?.name ?? "",
            description: category?.description ?? "",
            parentId: category?.parent?.id ? String(category.parent.id) : null,
          },
        }}
        schema={updateCategoryInputSchema}
      >
        {({ register, formState }) => (
          <>
            <Input
              label="Name"
              error={formState.errors["name"]}
              registration={register("name")}
            />
            <Textarea
              label="Description"
              error={formState.errors["description"]}
              registration={register("description")}
            />
            <TreeSelect
              label="Parent"
              placeholder="Select parent category..."
              error={formState.errors["parentId"]}
              registration={register("parentId")}
              data={treeData}
              loading={categoriesQuery.isLoading}
              multiple={false}
            />
          </>
        )}
      </Form>
    </FormDrawer>
  );
};
