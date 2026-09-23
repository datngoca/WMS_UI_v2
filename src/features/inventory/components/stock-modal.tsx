import * as React from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  Search,
  Check,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/products/api/get-products";
import { cn } from "@/utils/cn";

import { useAddStock } from "../api/add-stock";
import { useRemoveStock } from "../api/remove-stock";
import type { InventoryItem } from "../types";

export type StockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: "in" | "out";
  selectedItem?: InventoryItem | null;
};

export const StockModal = ({
  isOpen,
  onClose,
  mode,
  selectedItem,
}: StockModalProps) => {
  const [productId, setProductId] = React.useState<number | null>(null);
  const [productSearch, setProductSearch] = React.useState("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [reason, setReason] = React.useState<string>("");

  const productsQuery = useProducts({ page: 1, size: 100 });
  const allProducts = productsQuery.data?.data || [];

  const addStockMutation = useAddStock({
    mutationConfig: {
      onSuccess: () => {
        handleClose();
      },
    },
  });

  const removeStockMutation = useRemoveStock({
    mutationConfig: {
      onSuccess: () => {
        handleClose();
      },
    },
  });

  React.useEffect(() => {
    if (selectedItem) {
      setProductId(selectedItem.productId);
      setProductSearch(selectedItem.productName);
    } else {
      setProductId(null);
      setProductSearch("");
    }
    setQuantity(1);
    setReason(
      mode === "in" ? "Nhập hàng từ nhà cung cấp" : "Xuất điều chuyển kho",
    );
  }, [selectedItem, mode, isOpen]);

  const handleClose = () => {
    onClose();
  };

  const filteredProducts = React.useMemo(() => {
    if (!productSearch) return allProducts.slice(0, 10);
    return allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.sku.toLowerCase().includes(productSearch.toLowerCase()),
      )
      .slice(0, 10);
  }, [allProducts, productSearch]);

  const isPending = addStockMutation.isPending || removeStockMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity <= 0) return;

    if (mode === "in") {
      addStockMutation.mutate({
        data: {
          productId,
          quantity,
          reason,
        },
      });
    } else {
      removeStockMutation.mutate({
        data: {
          productId,
          quantity,
          reason,
        },
      });
    }
  };

  const isInMode = mode === "in";

  const reasonSuggestions = isInMode
    ? [
        "Nhập hàng từ nhà cung cấp",
        "Nhập bổ sung định kỳ",
        "Hàng khách trả lại",
        "Điều chỉnh sau kiểm kê",
      ]
    : [
        "Xuất bán lẻ",
        "Xuất điều chuyển chi nhánh",
        "Xuất huỷ hàng hỏng",
        "Điều chỉnh sau kiểm kê",
      ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "size-8 rounded-lg flex items-center justify-center shrink-0",
                isInMode
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700",
              )}
            >
              {isInMode ? (
                <ArrowDownToLine className="size-4" />
              ) : (
                <ArrowUpFromLine className="size-4" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {isInMode ? "Tạo Phiếu Nhập Kho" : "Tạo Phiếu Xuất Kho"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isInMode
                  ? "Cộng thêm số lượng tồn kho cho sản phẩm"
                  : "Giảm bớt số lượng tồn kho của sản phẩm"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Chọn sản phẩm */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Sản phẩm <span className="text-rose-500">*</span>
            </label>

            {selectedItem ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-slate-900 block">
                    {selectedItem.productName}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    SKU: {selectedItem.productSku}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Tồn hiện tại</span>
                  <span className="font-mono font-bold text-xs text-primary">
                    {selectedItem.quantity}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên sản phẩm hoặc mã SKU..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setProductId(null);
                    }}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                  />
                </div>

                {productSearch && !productId && (
                  <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100 shadow-sm">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setProductId(p.id);
                            setProductSearch(p.name);
                          }}
                          className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <span className="font-medium text-slate-800 block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">
                              SKU: {p.sku}
                            </span>
                          </div>
                          <Package className="size-3.5 text-slate-400 shrink-0" />
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        Không tìm thấy sản phẩm phù hợp
                      </div>
                    )}
                  </div>
                )}

                {productId && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60">
                    <Check className="size-3.5" />
                    <span>Đã chọn: {productSearch}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Số lượng */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Số lượng {isInMode ? "nhập" : "xuất"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white font-mono font-bold text-slate-900"
            />
          </div>

          {/* Lý do */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Lý do thực hiện
            </label>
            <input
              type="text"
              placeholder="Nhập lý do hoặc chọn gợi ý bên dưới"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
            />
            {/* Gợi ý lý do */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {reasonSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setReason(sug)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
              className="h-8 text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant={isInMode ? "default" : "destructive"}
              size="sm"
              disabled={!productId || quantity <= 0 || isPending}
              isLoading={isPending}
              className="h-8 text-xs"
            >
              {isInMode ? "Xác nhận nhập kho" : "Xác nhận xuất kho"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
