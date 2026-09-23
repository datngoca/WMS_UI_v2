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
  isScrapingLotte = false,
  galleryImages: propGalleryImages,
  setGalleryImages: propSetGalleryImages,
}: GeneralTabProps) => {
  const { addNotifications, addNotification } = useNotifications() as any;
  const notify = addNotification || addNotifications;
  const [isGeneratingSku, setIsGeneratingSku] = React.useState(false);
  const [localGalleryImages, setLocalGalleryImages] = React.useState<string[]>([]);
  const galleryImages = propGalleryImages ?? localGalleryImages;
  const setGalleryImages = propSetGalleryImages ?? setLocalGalleryImages;
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
        {onOpenScanner && (
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => onOpenScanner("sku", "Mã sản phẩm (SKU)")}
              disabled={isScrapingLotte}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md border border-emerald-300 bg-emerald-50 text-sm font-medium text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
              title="Bật camera quét mã vạch hoặc mã QR để tự động cào dữ liệu từ Lotte Mart"
            >
              <ScanBarcode className="size-4" />
              <span>Quét mã & tự động điền</span>
            </button>
          </div>
        )}
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

        <div className="flex items-start gap-3.5 pt-0.5">
          {/* Ảnh xem trước bên hông */}
          <div className="relative size-20 sm:size-24 rounded-xl border bg-white dark:bg-card shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt="Product Preview"
                className="w-full h-full object-contain p-1.5 transition-transform hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-2 text-muted-foreground/60">
                <ImageIcon className="size-6 sm:size-7 stroke-[1.5]" />
                <span className="text-[10px] mt-1 text-muted-foreground/80 font-medium">Chưa có ảnh</span>
              </div>
            )}
          </div>

          {/* Ô nhập URL và Thư viện ảnh bên cạnh */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="space-y-1">
              <input
                {...register("imageUrl")}
                placeholder="Dán URL ảnh hoặc quét barcode để tự động điền..."
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

            {/* Gallery thumbnails nếu cào được nhiều ảnh */}
            {galleryImages.length > 1 ? (
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Thư viện ({galleryImages.length} ảnh - bấm để chọn ảnh đại diện):
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {galleryImages.map((img, idx) => {
                    const isSelected = img === currentImageUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setValue("imageUrl", img, { shouldValidate: true, shouldDirty: true })}
                        className={cn(
                          "relative size-11 sm:size-12 rounded-lg overflow-hidden border p-0.5 shrink-0 bg-white transition-all cursor-pointer",
                          isSelected
                            ? "border-primary ring-2 ring-primary/40 shadow-xs"
                            : "border-border hover:border-primary/50 opacity-60 hover:opacity-100",
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
            ) : (
              <p className="text-[11px] text-muted-foreground/80 italic">
                * Có thể dán đường link ảnh trực tiếp hoặc quét mã barcode để tự động tải ảnh.
              </p>
            )}
          </div>
        </div>
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
