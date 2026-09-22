import * as React from "react";
import { Plus, Package } from "lucide-react";

import { useNotifications } from "@/components/ui/notifications";
import { Button } from "@/components/ui/button";
import { Form, FormDrawer } from "@/components/ui/form";

import { useCategories } from "@/features/categories/api/get-categories";
import { transformCategoriesToTreeData } from "@/features/categories/utils/category-tree";
import { useUnits } from "@/features/units/api/get-units";
import {
  type CreateProductInput,
  useCreateProduct,
  createProductInputSchema,
} from "../../api/create-product";

import { ProductFormContent } from "./product-form-content";
import type { TabKey } from "./types";

export const CreateProduct = () => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = React.useState<TabKey>("general");

  const categoriesQuery = useCategories({});
  const unitsQuery = useUnits({ size: 100 });

  const createProductMutation = useCreateProduct({
    mutationConfig: {
      onSuccess: (value) => {
        addNotification({
          type: "success",
          title: value.message || "Tạo sản phẩm thành công",
        });
      },
    },
  });

  const categoriesTreeData = React.useMemo(() => {
    return transformCategoriesToTreeData(categoriesQuery.data?.data || []);
  }, [categoriesQuery.data?.data]);

  const unitOptions = React.useMemo(() => {
    return (unitsQuery.data?.data || []).map((u) => ({
      label: `${u.name} (${u.code})`,
      value: String(u.id),
    }));
  }, [unitsQuery.data?.data]);

  const onSubmit = (values: CreateProductInput) => {
    const payload: CreateProductInput = {
      ...values,
      sku: values.sku?.trim() || undefined,
      imageUrl: values.imageUrl?.trim() || undefined,
      productUnits:
        values.productUnits?.map((unit) => ({
          ...unit,
          sku: unit.sku?.trim() || undefined,
          imageUrl: unit.imageUrl?.trim() || undefined,
          price: Number(unit.price) || 0,
          exchangeValue: Number(unit.exchangeValue) || 1,
          unitId: Number(unit.unitId),
          isBaseUnit: Boolean(unit.isBaseUnit),
        })) || [],
      specs: values.specs || [],
      options: values.options || [],
    };
    createProductMutation.mutate({ data: payload });
  };

  const defaultValues: CreateProductInput = {
    sku: "",
    name: "",
    description: "",
    imageUrl: "",
    categories: [],
    productUnits: [],
    specs: [],
    options: [],
  };

  return (
    <FormDrawer
      isDone={createProductMutation.isSuccess}
      triggerButton={
        <Button
          size="sm"
          icon={<Plus className="size-4" />}
          className="cursor-pointer"
        >
          Thêm sản phẩm
        </Button>
      }
      title="Tạo mới sản phẩm"
      description="Cấu hình thông tin chung, đơn vị giá, thông số và tùy chọn"
      icon={<Package className="size-4 sm:size-5" />}
      submitButton={
        <Button
          form="create-product"
          type="submit"
          size="sm"
          isLoading={createProductMutation.isPending}
          className="cursor-pointer"
        >
          Lưu sản phẩm
        </Button>
      }
    >
      <Form<typeof createProductInputSchema, CreateProductInput>
        id="create-product"
        onSubmit={onSubmit}
        schema={createProductInputSchema}
        options={{
          defaultValues,
        }}
      >
        {({ register, formState, control, setValue, watch }) => {
          return (
            <ProductFormContent
              activeTab={activeTab}
              onTabChange={setActiveTab}
              register={register}
              formState={formState}
              control={control}
              setValue={setValue}
              watch={watch}
              categoriesTreeData={categoriesTreeData}
              unitOptions={unitOptions}
            />
          );
        }}
      </Form>
    </FormDrawer>
  );
};