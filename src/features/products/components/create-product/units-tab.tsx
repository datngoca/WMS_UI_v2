import { useFieldArray } from "react-hook-form";
import { Plus, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";

import { UnitItemCard } from "./unit-item-card";
import type { UnitsTabProps } from "./types";

export const UnitsTab = ({
  control,
  register,
  errors,
  unitOptions,
  onOpenScanner,
}: UnitsTabProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "productUnits",
  });

  const handleAddUnit = () => {
    append({
      sku: "",
      barcode: "",
      imageUrl: "",
      exchangeValue: fields.length === 0 ? 1 : 12,
      price: 0,
      unitId: unitOptions[0]?.value ? Number(unitOptions[0].value) : 1,
      isBaseUnit: fields.length === 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Danh sách đơn vị tính & Giá
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cấu hình đơn vị cơ bản và các đơn vị quy đổi (thùng, lốc, hộp...)
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddUnit}
          icon={<Plus className="size-3.5" />}
        >
          Thêm đơn vị
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center bg-muted/20">
          <Layers className="size-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            Chưa có đơn vị tính nào
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
            Nhấn "Thêm đơn vị" để cấu hình đơn vị cơ bản và giá bán cho sản phẩm.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <UnitItemCard
              key={field.id}
              index={index}
              control={control}
              register={register}
              errors={errors}
              unitOptions={unitOptions}
              onRemove={() => remove(index)}
              onOpenScanner={onOpenScanner}
            />
          ))}
        </div>
      )}
    </div>
  );
};
