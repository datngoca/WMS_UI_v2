import { useFieldArray } from "react-hook-form";
import { Plus, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import { OptionItemCard } from "./option-item-card";
import type { OptionsTabProps } from "./types";

export const OptionsTab = ({ control, register, errors }: OptionsTabProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const handleAddOption = () => {
    append({
      name: "",
      type: "select",
      values: [{ label: "", value: "" }],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Tùy chọn biến thể
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Các nhóm biến thể cho sản phẩm như Màu sắc, Kích thước, Dung tích...
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddOption}
          icon={<Plus className="size-3.5" />}
        >
          Thêm tùy chọn
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center bg-muted/20">
          <SlidersHorizontal className="size-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            Chưa có tùy chọn biến thể nào
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
            Nhấn "Thêm tùy chọn" để tạo các nhóm biến thể như Màu sắc, Size...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, optionIndex) => (
            <OptionItemCard
              key={field.id}
              optionIndex={optionIndex}
              control={control}
              register={register}
              errors={errors}
              onRemove={() => remove(optionIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
