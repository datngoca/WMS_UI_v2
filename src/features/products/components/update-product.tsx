import * as React from "react";
import { Pen, Package, Info } from "lucide-react";

import { useNotifications } from "@/components/ui/notifications";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Form, FormDrawer } from "@/components/ui/form";
import type { Product } from "@/types/api";

import { useCategories } from "@/features/categories/api/get-categories";
import { transformCategoriesToTreeData } from "@/features/categories/utils/category-tree";
import { useUnits } from "@/features/units/api/get-units";
import { useProduct } from "../api/get-product";
import {
  type UpdateProductInput,
  updateProductInputSchema,
  useUpdateProduct,
} from "../api/update-product";

import { ProductFormContent } from "./create-product/product-form-content";
import type { TabKey } from "./create-product/types";

export type UpdateProductProps = {
  productId: number;
  initialProduct?: Product;
  triggerButton?: React.ReactElement;
};

export const UpdateProduct = ({
  productId,
  initialProduct,
  triggerButton,
}: UpdateProductProps) => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = React.useState<TabKey>("general");

  const categoriesQuery = useCategories({});
  const unitsQuery = useUnits({ size: 100 });

  const productQuery = useProduct({
    productId,
    queryConfig: {
      enabled: !initialProduct && Boolean(productId),
    },
  });

  const product = initialProduct || productQuery.data?.data;
  const isLoading = !initialProduct && productQuery.isLoading;

  const updateProductMutation = useUpdateProduct({
    mutationConfig: {
      onSuccess: (value) => {
        addNotification({
          type: "success",
          title: value.message || "Cập nhật sản phẩm thành công",
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

  const defaultValues: UpdateProductInput = React.useMemo(() => {
    if (!product) {
      return {
        sku: "",
        name: "",
        description: "",
        categories: [],
        productUnits: [],
        specs: [],
        options: [],
      };
    }

    return {
      sku: product.sku || "",
      name: product.name || "",
      description: product.description || "",
      categories: product.categories?.map((c) => c.id) || [],
      productUnits:
        product.productUnits?.map((unit) => ({
          sku: "",
          barcode: "",
          exchangeValue: unit.exchangeValue || 1,
          price: unit.price || 0,
          unitId: unit.unit?.id || 1,
          isBaseUnit: Boolean(unit.isBaseUnit),
        })) || [],
      specs: product.specs || [],
      options: product.options || [],
    };
  }, [product]);

  const onSubmit = (values: UpdateProductInput) => {
    const payload: UpdateProductInput = {
      ...values,
      sku: values.sku?.trim() || undefined,
      productUnits:
        values.productUnits?.map((unit) => ({
          ...unit,
          sku: unit.sku?.trim() || undefined,
          price: Number(unit.price) || 0,
          exchangeValue: Number(unit.exchangeValue) || 1,
          unitId: Number(unit.unitId),
          isBaseUnit: Boolean(unit.isBaseUnit),
        })) || [],
      specs: values.specs || [],
      options: values.options || [],
    };

    updateProductMutation.mutate({ productId, data: payload });
  };

  const formId = `update-product-${productId}`;

  return (
    <FormDrawer
      isDone={updateProductMutation.isSuccess}
      triggerButton={
        triggerButton || (
          <Button
            size="sm"
            variant="ghost"
            className="size-7 p-0 text-muted-foreground hover:text-primary cursor-pointer"
            title="Chỉnh sửa sản phẩm"
          >
            <Pen className="size-3.5" />
          </Button>
        )
      }
      title={product ? `Cập nhật: ${product.name}` : "Cập nhật sản phẩm"}
      description="Chỉnh sửa thông tin chung, đơn vị giá, thông số và tùy chọn"
      icon={<Package className="size-4 sm:size-5" />}
      submitButton={
        <Button
          form={formId}
          type="submit"
          size="sm"
          isLoading={updateProductMutation.isPending}
          className="cursor-pointer"
        >
          Lưu thay đổi
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex h-80 flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-muted-foreground animate-pulse">
            Đang tải dữ liệu sản phẩm...
          </p>
        </div>
      ) : !product ? (
        <div className="flex h-80 flex-col items-center justify-center gap-2 p-6 text-center">
          <Info className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">
            Không tìm thấy thông tin sản phẩm
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Sản phẩm có thể đã bị xóa hoặc không tồn tại.
          </p>
        </div>
      ) : (
        <Form<typeof updateProductInputSchema, UpdateProductInput>
          id={formId}
          onSubmit={onSubmit}
          schema={updateProductInputSchema}
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
      )}
    </FormDrawer>
  );
};
