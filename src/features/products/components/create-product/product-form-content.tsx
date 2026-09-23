import * as React from "react";
import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { Package, Layers, FileText, SlidersHorizontal, Sparkles } from "lucide-react";

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

  const [scrapingSku, setScrapingSku] = React.useState<string | null>(null);
  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);
  const isScrapingLotte = Boolean(scrapingSku);

  // Chặn toàn bộ sự kiện bàn phím (kể cả phím ESC đóng drawer) khi đang cào dữ liệu
  React.useEffect(() => {
    if (isScrapingLotte) {
      const handleKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation();
        e.preventDefault();
      };
      window.addEventListener("keydown", handleKeyDown, { capture: true });
      return () => {
        window.removeEventListener("keydown", handleKeyDown, { capture: true });
      };
    }
  }, [isScrapingLotte]);

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
    async (sku?: string) => {
      const targetSku = sku || watch("sku");
      const cleanSku = extractSkuFromText(targetSku?.trim() || "");
      if (!cleanSku) {
        addNotification({
          type: "warning",
          title: "Chưa có mã SKU",
          message: "Vui lòng nhập mã SKU hoặc quét mã trước khi lấy dữ liệu Lotte Mart",
        });
        return;
      }

      // Đảm bảo trường SKU hiển thị mã sạch
      setValue("sku", cleanSku, { shouldValidate: true, shouldDirty: true });

      try {
        setScrapingSku(cleanSku);

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
          if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
            setGalleryImages(prod.images);
          } else if (prod.imageUrl) {
            setGalleryImages([prod.imageUrl]);
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
      } finally {
        setScrapingSku(null);
      }
    },
    [addNotification, setValue, watch, queryClient],
  );

  return (
    <div className="space-y-4">
      {/* Segmented Tab Bar */}
      <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/60 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex-1 min-w-fit flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer select-none",
                isActive
                  ? "bg-background text-primary shadow-xs font-semibold border border-border/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className="px-1.5 py-0 text-[10px] h-3.5 shrink-0 font-normal"
                >
                  {tab.count}
                </Badge>
              )}
              {tab.hasError && (
                <span className="size-1.5 rounded-full bg-destructive animate-pulse shrink-0" />
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
            isScrapingLotte={isScrapingLotte}
            galleryImages={galleryImages}
            setGalleryImages={setGalleryImages}
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

      {/* Blocking Spinner Overlay when scraping LOTTE Mart */}
      {isScrapingLotte && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Đang cào dữ liệu LOTTE Mart"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all select-none cursor-wait p-4 animate-in fade-in-0 duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            className="relative w-full max-w-md p-6 sm:p-8 bg-card border border-border/80 shadow-2xl rounded-2xl flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Animated Spinner */}
            <div className="relative flex items-center justify-center">
              <div className="absolute size-20 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
              <div className="relative size-16 rounded-full border-4 border-rose-500/20 border-t-rose-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="size-6 text-rose-600 animate-pulse" />
              </div>
            </div>

            {/* Badge & Title */}
            <div className="space-y-1.5 flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <span className="size-2 rounded-full bg-rose-600 animate-ping" />
                <span>LOTTE Mart Product Scraper</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight pt-1">
                Đang cào dữ liệu từ LOTTE Mart...
              </h3>
              {scrapingSku && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/80 border border-border text-xs font-mono text-foreground font-medium">
                  <span className="text-muted-foreground font-sans">Mã SKU:</span>
                  <span>{scrapingSku}</span>
                </div>
              )}
            </div>

            {/* Step Indicators */}
            <div className="w-full bg-muted/40 rounded-xl p-3.5 border text-left text-xs space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 font-semibold text-[10px]">
                  1
                </span>
                <span>Tìm kiếm & đồng bộ thông tin từ LOTTE Mart</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 font-semibold text-[10px]">
                  2
                </span>
                <span>Tự động phân tách quy cách (thùng, lốc, lẻ)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 font-semibold text-[10px]">
                  3
                </span>
                <span>Điền hình ảnh, giá, mô tả và danh mục vào form</span>
              </div>
            </div>

            {/* Blocking Warning */}
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic">
              * Hệ thống đang xử lý và tạm thời khóa các thao tác trên màn hình để đảm bảo toàn vẹn dữ liệu. Vui lòng đợi trong giây lát...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
