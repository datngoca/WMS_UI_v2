import * as React from "react";
import {
  Receipt,
  User,
  Phone,
  FileText,
  AlertTriangle,
  Package,
  Ban,
  CheckCircle2,
  Clock,
  Printer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormDrawer } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

import type { Order, OrderStatus } from "../types";
import { useOrder } from "../api/get-order";
import { useCancelOrder } from "../api/cancel-order";

export type OrderDetailDrawerProps = {
  orderId?: number;
  order?: Order;
  triggerButton?: React.ReactElement;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "success" | "destructive" | "warning" | "default"; icon: React.ReactNode; bgClass: string }
> = {
  CONFIRMED: {
    label: "Đã hoàn tất",
    variant: "success",
    icon: <CheckCircle2 className="size-3.5" />,
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  PENDING: {
    label: "Chờ xác nhận",
    variant: "warning",
    icon: <Clock className="size-3.5" />,
    bgClass: "bg-amber-50 text-amber-700 border-amber-200/80",
  },
  CANCELLED: {
    label: "Đã hủy đơn",
    variant: "destructive",
    icon: <Ban className="size-3.5" />,
    bgClass: "bg-rose-50 text-rose-700 border-rose-200/80",
  },
};

export const OrderDetailDrawer = ({
  orderId,
  order: initialOrder,
  triggerButton,
  isOpen: controlledIsOpen,
  onOpenChange: setControlledIsOpen,
}: OrderDetailDrawerProps) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = React.useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? setControlledIsOpen ?? (() => {}) : setInternalIsOpen;

  const orderQuery = useOrder({
    id: orderId || 0,
    queryConfig: {
      enabled: isOpen && !initialOrder && Boolean(orderId),
    },
  });

  const cancelMutation = useCancelOrder({
    mutationConfig: {
      onSuccess: () => {
        setShowConfirmCancel(false);
      },
    },
  });

  const order = initialOrder || orderQuery.data?.data;
  const isLoading = !initialOrder && orderQuery.isLoading;

  const handlePrint = () => {
    window.print();
  };

  const handleCancelOrder = () => {
    if (!order?.id) return;
    cancelMutation.mutate({ id: order.id });
  };

  const statusInfo = order ? statusConfig[order.status] || statusConfig.PENDING : null;

  return (
    <FormDrawer
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setShowConfirmCancel(false);
      }}
      triggerButton={triggerButton}
      title={order ? `Đơn hàng #${order.orderCode}` : "Chi tiết đơn hàng"}
      description={order ? `Ngày tạo: ${formatDate(order.createdAt)}` : undefined}
      icon={<Receipt className="size-4 sm:size-5 text-primary" />}
      size="lg"
      closeButtonText="Đóng"
      footerContent={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8 gap-1.5"
          >
            <Printer className="size-3.5" />
            In phiếu
          </Button>
          {order && order.status !== "CANCELLED" && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirmCancel(true)}
              className="text-xs h-8 gap-1.5"
              disabled={cancelMutation.isPending}
            >
              <Ban className="size-3.5" />
              Hủy đơn
            </Button>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-muted-foreground">Đang tải chi tiết đơn hàng...</p>
        </div>
      ) : !order ? (
        <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="size-8 text-amber-500 mb-2" />
          <p className="text-sm font-medium">Không tìm thấy dữ liệu đơn hàng</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cảnh báo xác nhận hủy đơn */}
          {showConfirmCancel && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-900 space-y-2.5 animate-in fade-in-50">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-rose-950">
                    Bạn có chắc chắn muốn hủy đơn hàng này không?
                  </p>
                  <p className="text-rose-700 leading-relaxed">
                    Sau khi hủy, số lượng tồn kho của các sản phẩm trong đơn sẽ tự động được hoàn lại kho. Thao tác này không thể hoàn tác.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmCancel(false)}
                  disabled={cancelMutation.isPending}
                  className="h-7 text-xs bg-white"
                >
                  Không, giữ lại
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelOrder}
                  isLoading={cancelMutation.isPending}
                  className="h-7 text-xs"
                >
                  Xác nhận hủy
                </Button>
              </div>
            </div>
          )}

          {/* Banner thông tin đơn hàng & Trạng thái */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Mã đơn hàng
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base sm:text-lg text-slate-900">
                  {order.orderCode}
                </span>
              </div>
            </div>

            {statusInfo && (
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold self-start sm:self-center",
                  statusInfo.bgClass,
                )}
              >
                {statusInfo.icon}
                <span>{statusInfo.label}</span>
              </div>
            )}
          </div>

          {/* Thông tin Khách hàng & Ghi chú */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <User className="size-3.5 text-primary" />
                <span>Khách hàng</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-medium text-slate-900">
                  {order.customerName || "Khách lẻ tại quầy"}
                </p>
                {order.customerPhone && (
                  <p className="flex items-center gap-1 text-slate-500">
                    <Phone className="size-3" />
                    <span>{order.customerPhone}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <FileText className="size-3.5 text-primary" />
                <span>Ghi chú đơn hàng</span>
              </div>
              <p className="text-xs text-slate-600 italic">
                {order.note || "Không có ghi chú"}
              </p>
            </div>
          </div>

          {/* Danh sách mặt hàng */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Package className="size-3.5 text-primary" />
                Danh sách sản phẩm ({order.items?.length || 0})
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Sản phẩm</th>
                    <th className="py-2.5 px-2 text-right">SL</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900 line-clamp-1">
                            {item.productName || "Sản phẩm"}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            SKU: {item.productSku || "—"}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-slate-700">
                          x{item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold font-mono text-slate-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        Không có sản phẩm trong đơn
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-slate-50/60 font-semibold">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-right text-slate-700">
                      Tổng tiền thanh toán:
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-bold font-mono text-primary">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </FormDrawer>
  );
};
