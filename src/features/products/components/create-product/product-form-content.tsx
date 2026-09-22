import * as React from "react";
import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { Package, Layers, FileText, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/components/ui/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/utils/cn";
import { PosScannerModal } from "@/features/pos/components/pos-scanner-modal";
import type { transformCategoriesToTreeData } from "@/features/categories/utils/category-tree";

import type { CreateProductInput } from "../../api/create-product";
import { lookupProductBySku, extractSkuFromText } from "../../api/lookup-scanner";
import { GeneralTab } from "./general-tab";
import { UnitsTab } from "./units-tab";
import { SpecsTab } from "./specs-tab";
import { OptionsTab } from "./options-tab";
import type { TabItem, TabKey } from "./types";

export type ProductFormContentProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  register: UseFormRegister<CreateProductInput>;
  formState: { errors?: FieldErrors<CreateProductInput> };
  control: Control<CreateProductInput>;
  setValue: UseFormSetValue<CreateProductInput>;
  watch: UseFormWatch<CreateProductInput>;
  categoriesTreeData: ReturnType<typeof transformCategoriesToTreeData>;
  unitOptions: Array<{ label: string; value: string }>;
};

export const ProductFormContent = ({
  activeTab,
  onTabChange,
  register,
  formState,
  control,
  setValue,
  watch,
  categoriesTreeData,
  unitOptions,
}: ProductFormContentProps) => {
  const { addNotification } = useNotifications();
  const [scanTarget, setScanTarget] = React.useState<{
    fieldName: string;
    label: string;
  } | null>(null);

  const handleOpenScanner = React.useCallback(
    (fieldName: string, label: string) => {
      setScanTarget({ fieldName, label });
    },
    [],
  );
  const unitFields = useWatch({ control, name: "productUnits" }) || [];
  const specFields = useWatch({ control, name: "specs" }) || [];
  const optionFields = useWatch({ control, name: "options" }) || [];

  const errors = formState.errors || {};

  const hasGeneralError = Boolean(
    errors.sku || errors.name || errors.categories || errors.description,
  );
  const hasUnitsError = Boolean(errors.productUnits);
  const hasSpecsError = Boolean(errors.specs);
  const hasOptionsError = Boolean(errors.options);

  const tabs: TabItem[] = [
    {
      key: "general",
      label: "Thông tin chung",
      icon: Package,
      hasError: hasGeneralError,
    },
    {
      key: "units",
      label: "Đơn vị & Giá",
      icon: Layers,
      count: unitFields.length,
      hasError: hasUnitsError,
    },
    {
      key: "specs",
      label: "Thông số",
      icon: FileText,
      count: specFields.length,
      hasError: hasSpecsError,
    },
    {
      key: "options",
      label: "Tùy chọn",
      icon: SlidersHorizontal,
      count: optionFields.length,
      hasError: hasOptionsError,
    },
  ];

  const queryClient = useQueryClient();

  const fetchAndFillFromLotte = React.useCallback(
    async (sku: string) => {
      const cleanSku = sku.trim();
      if (!cleanSku) return;

      try {
        addNotification({
          type: "info",
          title: "Đang tra cứu Lotte Mart...",
          message: `Mã SKU: ${cleanSku}`,
        });

        const data = await lookupProductBySku(cleanSku);

        if (data?.status === "SUCCESS" && data?.product) {
          const prod = data.product;

          // Tự động làm mới cache categories & units khi service đã tạo mới vào DB
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          queryClient.invalidateQueries({ queryKey: ["units"] });

          if (prod.name) {
            setValue("name", prod.name, { shouldValidate: true, shouldDirty: true });
          }
          if (prod.imageUrl) {
            setValue("imageUrl", prod.imageUrl, { shouldValidate: true, shouldDirty: true });
          }
          if (prod.description) {
            setValue("description", prod.description, { shouldValidate: true, shouldDirty: true });
          }
          if (prod.categories && Array.isArray(prod.categories) && prod.categories.length > 0) {
            setValue("categories", prod.categories, { shouldValidate: true, shouldDirty: true });
          }
          if (prod.productUnits && Array.isArray(prod.productUnits) && prod.productUnits.length > 0) {
            setValue("productUnits", prod.productUnits, { shouldValidate: true, shouldDirty: true });
          }
          if (prod.specs && Array.isArray(prod.specs) && prod.specs.length > 0) {
            setValue("specs", prod.specs, { shouldValidate: true, shouldDirty: true });
          }
          if (prod.options && Array.isArray(prod.options) && prod.options.length > 0) {
            setValue("options", prod.options, { shouldValidate: true, shouldDirty: true });
          }

          addNotification({
            type: "success",
            title: "Đã lấy dữ liệu từ LOTTE Mart!",
            message: `Sản phẩm: ${prod.name} (${prod.productUnits?.length || 1} quy cách). Vui lòng kiểm tra và lưu lại.`,
          });
        } else {
          addNotification({
            type: "warning",
            title: "Không có dữ liệu trên LOTTE Mart",
            message: data?.message || `Không tìm thấy dữ liệu cho mã ${cleanSku}. Bạn vui lòng tự nhập thủ công.`,
          });
        }
      } catch (err: any) {
        addNotification({
          type: "warning",
          title: "Không thể kết nối Scanner Service",
          message: err?.message || "Hãy đảm bảo Scanner Python (cổng 8000) đang chạy. Bạn có thể tự nhập thông tin thủ công.",
        });
      }
    },
    [addNotification, setValue, queryClient],
  );

  return (
    <div className="space-y-4">
      {/* Mobile-Friendly Segmented Tab Bar */}
      <div className="flex border-b border-border/80 p-1 bg-muted/40 rounded-lg gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-white text-primary shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className="px-1.5 py-0 text-[10px] h-3.5"
                >
                  {tab.count}
                </Badge>
              )}
              {tab.hasError && (
                <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Container */}
      <div className="pt-1 space-y-4">
        {/* Tab 1: General Info */}
        <div className={cn(activeTab === "general" ? "space-y-4" : "hidden")}>
          <GeneralTab
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            categoriesTreeData={categoriesTreeData}
            onOpenScanner={handleOpenScanner}
          />
        </div>

        {/* Tab 2: Units & Prices */}
        <div className={cn(activeTab === "units" ? "space-y-4" : "hidden")}>
          <UnitsTab
            control={control}
            register={register}
            errors={errors}
            unitOptions={unitOptions}
            onOpenScanner={handleOpenScanner}
          />
        </div>

        {/* Tab 3: Specs */}
        <div className={cn(activeTab === "specs" ? "space-y-4" : "hidden")}>
          <SpecsTab
            control={control}
            register={register}
            errors={errors}
          />
        </div>

        {/* Tab 4: Options */}
        <div className={cn(activeTab === "options" ? "space-y-4" : "hidden")}>
          <OptionsTab
            control={control}
            register={register}
            errors={errors}
          />
        </div>
      </div>

      {/* QR & Barcode Scanner Modal for Product Form */}
      <PosScannerModal
        isOpen={Boolean(scanTarget)}
        onClose={() => setScanTarget(null)}
        title={scanTarget ? `Quét mã cho ${scanTarget.label}` : "Quét mã Barcode / QR"}
        description={
          scanTarget?.fieldName === "sku"
            ? "Quét mã QR/Barcode sản phẩm để tự động điền SKU và tìm kiếm thông tin trên Lotte Mart"
            : `Đưa mã vào khung ngắm để điền thông tin cho ${scanTarget?.label || "trường này"}`
        }
        preventCloseOnOutsideClick={true}
        onScanSuccess={async (code: string) => {
          if (scanTarget) {
            const targetField = scanTarget.fieldName;
            // Bóc tách mã số sạch nếu mã quét được là đường dẫn URL (ví dụ: https://maqr.vn/#/848140612516)
            const cleanCode = extractSkuFromText(code);

            setValue(targetField as any, cleanCode, {
              shouldValidate: true,
              shouldDirty: true,
            });
            setScanTarget(null);

            // Nếu quét cho trường SKU: tự động cào dữ liệu từ Lotte Mart để điền form
            if (targetField === "sku") {
              await fetchAndFillFromLotte(cleanCode);
            } else {
              addNotification({
                type: "success",
                title: `Đã quét ${scanTarget.label}`,
                message: `Mã: ${cleanCode}`,
              });
            }
          }
        }}
      />
    </div>
  );
};
