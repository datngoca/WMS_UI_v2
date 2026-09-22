import * as React from "react";
import { Sparkles, ScanBarcode, DownloadCloud, Loader2, Image as ImageIcon, ExternalLink, Trash2, Wand2 } from "lucide-react";

import { useNotifications } from "@/components/ui/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { Input, Label, Textarea, TreeSelect } from "@/components/ui/form";
import { cn } from "@/utils/cn";
import { cleanHtmlToText } from "@/utils/format";

import { generateSku } from "../../api/create-product";
import { lookupProductBySku, extractSkuFromText } from "../../api/lookup-scanner";
import type { GeneralTabProps } from "./types";

export const GeneralTab = ({
  register,
  errors,
  setValue,
  watch,
  categoriesTreeData,
  onOpenScanner,
}: GeneralTabProps) => {
  const { addNotifications, addNotification } = useNotifications() as any;
  const notify = addNotification || addNotifications;
  const queryClient = useQueryClient();
  const [isGeneratingSku, setIsGeneratingSku] = React.useState(false);
  const [isLoadingLotte, setIsLoadingLotte] = React.useState(false);
  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);
  const currentImageUrl = watch("imageUrl");
  const currentDescription = watch("description") || "";
  const hasHtmlInDescription = /<[a-z][\s\S]*>/i.test(currentDescription);

  const handleCleanDescriptionHtml = () => {
    const cleaned = cleanHtmlToText(currentDescription);
    setValue("description", cleaned, { shouldValidate: true, shouldDirty: true });
    notify({
      type: "success",
      title: "Đã làm sạch mã HTML",
      message: "Đã chuyển đổi mã HTML thành văn bản thuần có xuống dòng và gạch đầu dòng.",
    });
  };

  const handleGenerateSku = async () => {
    const currentName = watch("name");
    try {
      setIsGeneratingSku(true);
      const res = await generateSku({ name: currentName || "" });
      if (res?.data?.sku) {
        setValue("sku", res.data.sku, { shouldValidate: true, shouldDirty: true });
        addNotification({
          type: "info",
          title: `Đã sinh mã: ${res.data.sku}`,
        });
      }
    } catch {
      // Fallback cục bộ
      const localSlug =
        (currentName || "SAN-PHAM")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "D")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .toUpperCase()
          .slice(0, 40) || "SAN-PHAM";
      const fallbackSku = `SP-${localSlug}-00001`;
      setValue("sku", fallbackSku, { shouldValidate: true, shouldDirty: true });
      addNotification({
        type: "info",
        title: `Đã sinh mã: ${fallbackSku}`,
      });
    } finally {
      setIsGeneratingSku(false);
    }
  };

  const handleFetchLotteMart = async () => {
    const rawSku = watch("sku")?.trim();
    if (!rawSku) {
      addNotification({
        type: "warning",
        title: "Chưa có mã SKU",
        message: "Vui lòng nhập mã SKU hoặc bấm 'Quét mã' trước khi lấy dữ liệu Lotte Mart",
      });
      return;
    }

    const currentSku = extractSkuFromText(rawSku);
    if (currentSku !== rawSku) {
      setValue("sku", currentSku, { shouldValidate: true, shouldDirty: true });
    }

    try {
      setIsLoadingLotte(true);
      const data = await lookupProductBySku(currentSku);

      if (data?.status === "SUCCESS" && data?.product) {
        const prod = data.product;

        // Tự động làm mới cache categories & units khi service đã tạo mới vào DB
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["units"] });

        // 1. Tên sản phẩm
        if (prod.name) {
          setValue("name", prod.name, { shouldValidate: true, shouldDirty: true });
        }

        // 2. Ảnh sản phẩm & thư viện ảnh
        if (prod.imageUrl) {
          setValue("imageUrl", prod.imageUrl, { shouldValidate: true, shouldDirty: true });
        }
        if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
          setGalleryImages(prod.images);
        } else if (prod.imageUrl) {
          setGalleryImages([prod.imageUrl]);
        }

        // 3. Mô tả chi tiết
        if (prod.description) {
          setValue("description", prod.description, { shouldValidate: true, shouldDirty: true });
        }

        // 3. Danh mục ngành hàng
        if (prod.categories && Array.isArray(prod.categories) && prod.categories.length > 0) {
          setValue("categories", prod.categories, { shouldValidate: true, shouldDirty: true });
        }

        // 4. Đơn vị quy cách & giá (productUnits: lẻ, lốc, thùng)
        if (prod.productUnits && Array.isArray(prod.productUnits) && prod.productUnits.length > 0) {
          setValue("productUnits", prod.productUnits, { shouldValidate: true, shouldDirty: true });
        }

        // 5. Thông số nổi bật (specs)
        if (prod.specs && Array.isArray(prod.specs) && prod.specs.length > 0) {
          setValue("specs", prod.specs, { shouldValidate: true, shouldDirty: true });
        }

        // 6. Tùy chọn (options)
        if (prod.options && Array.isArray(prod.options) && prod.options.length > 0) {
          setValue("options", prod.options, { shouldValidate: true, shouldDirty: true });
        }

        addNotification({
          type: "success",
          title: "Đã lấy dữ liệu từ LOTTE Mart!",
          message: `Sản phẩm: ${prod.name} (${prod.productUnits?.length || 1} đơn vị quy cách)`,
        });
      } else {
        addNotification({
          type: "warning",
          title: "Không tìm thấy trên LOTTE Mart",
          message: data?.message || `Không có dữ liệu cho mã SKU: ${currentSku}`,
        });
      }
    } catch (err: any) {
      addNotification({
        type: "error",
        title: "Lỗi kết nối Scanner Service",
        message: err?.message || "Không thể kết nối đến Scanner Python (FastAPI cổng 8000). Hãy đảm bảo service đang chạy!",
      });
    } finally {
      setIsLoadingLotte(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Tên sản phẩm *"
          info="Tên hiển thị đầy đủ của sản phẩm"
          error={errors.name}
          registration={register("name")}
          placeholder="VD: Bánh quy bơ Danisa 454g"
        />
        <div className="flex items-center justify-between gap-2">
          <Input
            {...register("sku")}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              errors.sku && "border-destructive focus-visible:ring-destructive",
            )}
            placeholder="VD: 8936025772771 (hoặc để trống)"
          />
          {errors.sku?.message && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {errors.sku.message}
            </p>
          )}
          <div className="flex items-center gap-2.5">
            {onOpenScanner && (
              <button
                type="button"
                onClick={() => onOpenScanner("sku", "Mã sản phẩm (SKU)")}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                title="Bật camera quét mã vạch hoặc mã QR để điền SKU"
              >
                <ScanBarcode className="size-3.5" />
                <span>Quét mã</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hình ảnh sản phẩm & Gallery */}
      <div className="p-3.5 rounded-xl border bg-card/60 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <ImageIcon className="size-4 text-primary" />
            <span>Hình ảnh sản phẩm</span>
          </Label>
          {currentImageUrl && (
            <div className="flex items-center gap-2">
              <a
                href={currentImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                title="Mở ảnh gốc trong tab mới"
              >
                <ExternalLink className="size-3" />
                <span>Xem ảnh gốc</span>
              </a>
              <button
                type="button"
                onClick={() => setValue("imageUrl", "", { shouldValidate: true, shouldDirty: true })}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive hover:underline cursor-pointer"
                title="Xóa ảnh hiện tại"
              >
                <Trash2 className="size-3" />
                <span>Xóa ảnh</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <input
            {...register("imageUrl")}
            placeholder="URL ảnh sản phẩm (VD: https://... hoặc tự động điền khi quét/lấy từ LOTTE Mart)"
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              errors.imageUrl && "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.imageUrl?.message && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {errors.imageUrl.message}
            </p>
          )}
        </div>

        {/* Visual Preview & Gallery Selector */}
        {currentImageUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
            <div className="relative size-24 rounded-lg overflow-hidden border bg-white shadow-xs shrink-0 flex items-center justify-center">
              <img
                src={currentImageUrl}
                alt="Product Preview"
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="space-y-1.5 w-full">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Thư viện ảnh ({galleryImages.length} ảnh - bấm để chọn ảnh đại diện):
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  {galleryImages.map((img, idx) => {
                    const isSelected = img === currentImageUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setValue("imageUrl", img, { shouldValidate: true, shouldDirty: true })}
                        className={cn(
                          "relative size-14 rounded-md overflow-hidden border p-0.5 shrink-0 bg-white transition-all cursor-pointer",
                          isSelected
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50 opacity-70 hover:opacity-100",
                        )}
                        title={`Chọn ảnh ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-dashed bg-muted/20 text-xs text-muted-foreground">
            <ImageIcon className="size-5 text-muted-foreground/60 shrink-0" />
            <span>
              Chưa có hình ảnh. Bạn có thể nhập URL ảnh ở trên hoặc bấm <strong>&quot;Lấy từ Lotte Mart&quot;</strong> để tự động tải ảnh sản phẩm.
            </span>
          </div>
        )}
      </div>

      <TreeSelect
        label="Danh mục ngành hàng"
        info="Chọn một hoặc nhiều danh mục sản phẩm thuộc về"
        error={errors.categories}
        registration={register("categories")}
        placeholder="Chọn danh mục sản phẩm..."
        multiple={true}
        data={categoriesTreeData}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5">
            <span>Mô tả sản phẩm</span>
            <span className="text-[11px] text-muted-foreground font-normal">
              (Văn bản thuần có xuống dòng)
            </span>
          </Label>
          {hasHtmlInDescription && (
            <button
              type="button"
              onClick={handleCleanDescriptionHtml}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors cursor-pointer"
              title="Phát hiện thẻ HTML trong mô tả. Bấm để tự động loại bỏ thẻ tag và chuyển thành văn bản sạch"
            >
              <Wand2 className="size-3.5" />
              <span>Làm sạch thẻ HTML</span>
            </button>
          )}
        </div>
        <textarea
          {...register("description")}
          rows={4}
          className={cn(
            "flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-sans leading-relaxed",
            errors.description && "border-destructive focus-visible:ring-destructive",
          )}
          placeholder="Nhập mô tả sản phẩm, thành phần, hướng dẫn sử dụng, bảo quản..."
        />
        {errors.description?.message && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>
    </div>
  );
};
