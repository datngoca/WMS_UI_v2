import { Controller, useWatch } from "react-hook-form";
import { Trash2, ScanBarcode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Select, Switch, Label } from "@/components/ui/form";
import { cn } from "@/utils/cn";

import type { FormTabBaseProps } from "./types";

type UnitItemCardProps = FormTabBaseProps & {
  index: number;
  unitOptions: Array<{ label: string; value: string }>;
  onRemove: () => void;
};

export const UnitItemCard = ({
  index,
  control,
  register,
  errors,
  unitOptions,
  onRemove,
  onOpenScanner,
}: UnitItemCardProps) => {
  const unitImageUrl = useWatch({
    control,
    name: `productUnits.${index}.imageUrl`,
  });

  return (
    <div className="p-3.5 rounded-xl border bg-card/60 shadow-2xs space-y-3 relative hover:border-primary/40 transition-all">
      {/* Hidden input to ensure React Hook Form preserves unit imageUrl */}
      <input type="hidden" {...register(`productUnits.${index}.imageUrl`)} />

      {/* Header with wrap protection for small mobile screens */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2 flex-wrap">
          {unitImageUrl && (
            <a
              href={unitImageUrl}
              target="_blank"
              rel="noreferrer"
              title="Xem ảnh quy cách (mở tab mới)"
              className="size-8 rounded-md overflow-hidden border border-border bg-white shadow-2xs shrink-0 flex items-center justify-center hover:ring-2 hover:ring-primary/40 transition-all"
            >
              <img
                src={unitImageUrl}
                alt={`Unit #${index + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </a>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
            Đơn vị #{index + 1}
          </span>
          <Controller
            control={control}
            name={`productUnits.${index}.isBaseUnit`}
            render={({ field: switchField }) => (
              <label className="flex items-center gap-1.5 cursor-pointer ml-1 sm:ml-2">
                <Switch
                  checked={Boolean(switchField.value)}
                  onCheckedChange={switchField.onChange}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {switchField.value ? "Đơn vị cơ bản (Base)" : "Đơn vị quy đổi"}
                </span>
              </label>
            )}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8 p-0 cursor-pointer flex-shrink-0"
          title="Xóa đơn vị này"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">
              SKU đơn vị
            </Label>
            {onOpenScanner && (
              <button
                type="button"
                onClick={() =>
                  onOpenScanner(
                    `productUnits.${index}.sku`,
                    `SKU Đơn vị #${index + 1}`,
                  )
                }
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary hover:underline cursor-pointer"
                title="Quét mã SKU cho đơn vị này"
              >
                <ScanBarcode className="size-3" />
                <span>Quét mã</span>
              </button>
            )}
          </div>
          <input
            {...register(`productUnits.${index}.sku`)}
            placeholder="VD: SP-LON hoặc để trống"
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono",
              errors.productUnits?.[index]?.sku &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.productUnits?.[index]?.sku?.message && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {errors.productUnits[index]?.sku?.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground">
              Mã vạch (Barcode)
            </Label>
            {onOpenScanner && (
              <button
                type="button"
                onClick={() =>
                  onOpenScanner(
                    `productUnits.${index}.barcode`,
                    `Mã vạch Đơn vị #${index + 1}`,
                  )
                }
                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                title="Bật camera quét mã vạch cho đơn vị này"
              >
                <ScanBarcode className="size-3" />
                <span>Quét mã</span>
              </button>
            )}
          </div>
          <input
            {...register(`productUnits.${index}.barcode`)}
            placeholder="VD: 893500..."
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono",
              errors.productUnits?.[index]?.barcode &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.productUnits?.[index]?.barcode?.message && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {errors.productUnits[index]?.barcode?.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Controller
          control={control}
          name={`productUnits.${index}.unitId`}
          render={({ field: selectField }) => (
            <Select
              label="Loại đơn vị (Unit) *"
              placeholder="Chọn đơn vị..."
              options={unitOptions}
              value={selectField.value}
              onChange={(val) => selectField.onChange(Number(val))}
              error={errors.productUnits?.[index]?.unitId}
            />
          )}
        />
        <Input
          type="number"
          min={0}
          label="Giá bán (VND) *"
          placeholder="0"
          registration={register(`productUnits.${index}.price`, {
            valueAsNumber: true,
          })}
          error={errors.productUnits?.[index]?.price}
        />
        <Input
          type="number"
          min={1}
          label="Tỉ lệ quy đổi *"
          info="Số lượng đơn vị cơ bản trong 1 đơn vị này (Đơn vị cơ bản = 1)"
          placeholder="1"
          registration={register(`productUnits.${index}.exchangeValue`, {
            valueAsNumber: true,
          })}
          error={errors.productUnits?.[index]?.exchangeValue}
        />
      </div>
    </div>
  );
};
