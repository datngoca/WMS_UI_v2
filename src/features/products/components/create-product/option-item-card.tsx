import { Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";

import type { FormTabBaseProps } from "./types";

const OPTION_TYPE_OPTIONS = [
  { label: "Dropdown Select", value: "select" },
  { label: "Nút chọn (Button / Tag)", value: "button" },
  { label: "Hộp kiểm (Radio)", value: "radio" },
  { label: "Màu sắc (Color)", value: "color" },
];

type OptionItemCardProps = FormTabBaseProps & {
  optionIndex: number;
  onRemove: () => void;
};

export const OptionItemCard = ({
  optionIndex,
  control,
  register,
  errors,
  onRemove,
}: OptionItemCardProps) => {
  const {
    fields: valueFields,
    append: appendValue,
    remove: removeValue,
  } = useFieldArray({
    control,
    name: `options.${optionIndex}.values`,
  });

  return (
    <div className="p-3.5 rounded-xl border bg-card/60 shadow-2xs space-y-3 relative hover:border-primary/40 transition-all">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
          Nhóm tùy chọn #{optionIndex + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8 p-0 cursor-pointer"
          title="Xóa nhóm tùy chọn này"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Tên tùy chọn *"
          placeholder="VD: Màu sắc, Kích cỡ, Dung tích"
          registration={register(`options.${optionIndex}.name`)}
          error={errors.options?.[optionIndex]?.name}
        />
        <Controller
          control={control}
          name={`options.${optionIndex}.type`}
          render={({ field }) => (
            <Select
              label="Kiểu hiển thị *"
              options={OPTION_TYPE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.options?.[optionIndex]?.type}
            />
          )}
        />
      </div>

      {/* Values Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Các giá trị tùy chọn ({valueFields.length})
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2 cursor-pointer"
            onClick={() => appendValue({ label: "", value: "" })}
            icon={<Plus className="size-3" />}
          >
            Thêm giá trị
          </Button>
        </div>

        <div className="space-y-2">
          {valueFields.map((valField, valIndex) => (
            <div
              key={valField.id}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 sm:p-1.5 rounded-lg bg-muted/30 sm:bg-transparent border sm:border-0 border-border/60"
            >
              <div className="flex-1">
                <Input
                  placeholder="Nhãn (VD: Đỏ, Size M)"
                  registration={register(
                    `options.${optionIndex}.values.${valIndex}.label`,
                  )}
                  error={
                    errors.options?.[optionIndex]?.values?.[valIndex]?.label
                  }
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Mã giá trị (VD: red, m)"
                  registration={register(
                    `options.${optionIndex}.values.${valIndex}.value`,
                  )}
                  error={
                    errors.options?.[optionIndex]?.values?.[valIndex]?.value
                  }
                />
              </div>
              <div className="flex justify-end sm:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeValue(valIndex)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 sm:h-9 px-2 sm:px-0 sm:w-9 flex-shrink-0 cursor-pointer text-xs"
                  disabled={valueFields.length <= 1}
                  title="Xóa giá trị này"
                >
                  <Trash2 className="size-3.5 mr-1 sm:mr-0" />
                  <span className="inline sm:hidden">Xóa</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
