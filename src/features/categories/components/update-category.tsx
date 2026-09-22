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
import type { Category } from "@/types/api";

import { useCategories } from "../api/get-categories";
import { useCategory } from "../api/get-category";
import {
  updateCategoryInputSchema,
  useUpdateCategory,
} from "../api/update-category";
import { transformCategoriesToTreeData } from "../utils/category-tree";

type UpdateCategoryProps = {
  categoryId: number;
  initialCategory?: Category;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactElement | null;
};

export const UpdateCategory = ({
  categoryId,
  initialCategory,
  open,
  onOpenChange,
  triggerButton,
}: UpdateCategoryProps) => {
  const { addNotification } = useNotifications();

  // Dùng hook lấy danh sách categories (tận dụng cache TanStack Query)
  const categoriesQuery = useCategories({});
  const categories = categoriesQuery.data?.data;

  // Lấy chi tiết category cần sửa (chỉ fetch nếu chưa có initialCategory và modal đang mở hoặc uncontrolled)
  const isModalOpen = open === undefined || open;
  const categoryQuery = useCategory({
    categoryId,
    queryConfig: {
      enabled: !initialCategory && isModalOpen,
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
        onOpenChange?.(false);
      },
    },
  });

  // Chuyển đổi dữ liệu cây danh mục
  const treeData = React.useMemo(() => {
    if (!isModalOpen || !categories) return [];
    return transformCategoriesToTreeData(categories, categoryId);
  }, [categories, categoryId, isModalOpen]);

  const defaultTrigger = (
    <Button size="sm">
      <Pen className="size-4" />
    </Button>
  );

  const formId = `update-category-${categoryId}`;

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      isDone={updateCategoryMutation.isSuccess}
      triggerButton={triggerButton === null ? undefined : (triggerButton ?? defaultTrigger)}
      title="Sửa danh mục"
      submitButton={
        <Button
          form={formId}
          type="submit"
          size="sm"
          isLoading={updateCategoryMutation.isPending}
        >
          Submit
        </Button>
      }
    >
      <Form
        id={formId}
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
