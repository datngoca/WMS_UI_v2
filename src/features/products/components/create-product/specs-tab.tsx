import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

import type { SpecsTabProps } from "./types";

export const SpecsTab = ({ control, register, errors }: SpecsTabProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "specs",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Thông số kỹ thuật & Thuộc tính
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Các thuộc tính đặc thù như Xuất xứ, Trọng lượng, Hạn sử dụng...
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({ label: "", value: "" })}
          icon={<Plus className="size-3.5" />}
          className="cursor-pointer"
        >
          Thêm thông số
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center bg-muted/20">
          <FileText className="size-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            Chưa có thông số kỹ thuật nào
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
            Nhấn "Thêm thông số" để bổ sung các thuộc tính chi tiết cho sản phẩm.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 sm:p-3 rounded-xl border bg-card/60 transition-all hover:border-primary/40 shadow-2xs"
            >
              <div className="flex-1">
                <Input
                  placeholder="Tên thông số (VD: Xuất xứ, Trọng lượng)"
                  registration={register(`specs.${index}.label`)}
                  error={errors.specs?.[index]?.label}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Giá trị (VD: Việt Nam, 500g, 12 tháng)"
                  registration={register(`specs.${index}.value`)}
                  error={errors.specs?.[index]?.value}
                />
              </div>
              <div className="flex justify-end sm:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 sm:h-9 px-2 sm:px-0 sm:w-9 flex-shrink-0 cursor-pointer text-xs"
                  title="Xóa thông số"
                >
                  <Trash2 className="size-4 mr-1 sm:mr-0" />
                  <span className="inline sm:hidden">Xóa thông số</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
