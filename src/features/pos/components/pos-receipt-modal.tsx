import { Printer, PlusCircle, CheckCircle, Store } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/utils/format";
import type { PosOrder } from "../types";

export type PosReceiptModalProps = {
  order: PosOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
};

export const PosReceiptModal = ({
  order,
  isOpen,
  onClose,
  onNewOrder,
}: PosReceiptModalProps) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Tiền mặt";
      case "qr":
        return "Chuyển khoản QR";
      case "card":
        return "Thẻ POS";
      default:
        return method;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-2xl border-slate-200">
        <DialogHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Thanh toán thành công
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground font-mono">
                Mã đơn: {order.orderCode}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Printable Receipt Paper Container */}
        <div className="p-5 max-h-[70vh] overflow-y-auto bg-slate-50/50">
          <div
            id="pos-receipt-print"
            className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs text-slate-800 text-xs font-mono space-y-3 print:border-none print:shadow-none print:p-0"
          >
            {/* Store Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <div className="flex items-center justify-center gap-1.5 text-slate-900 font-bold text-sm tracking-wide">
                <Store className="size-4 text-primary" />
                <span>WMS SMART RETAIL</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Kho vận & Bán lẻ thông minh
              </p>
              <p className="text-[10px] text-muted-foreground">
                Địa chỉ: 123 Đường Công Nghệ, Q. Tân Bình, TP.HCM
              </p>
              <p className="text-[10px] text-muted-foreground">
                Hotline: 1900 6868 • Thu ngân: {order.cashierName}
              </p>
            </div>

            {/* Order Meta */}
            <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-slate-200">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã hóa đơn:</span>
                <span className="font-bold">{order.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời gian:</span>
                <span>
                  {formatDate(order.createdAt)} {order.createdAt.toLocaleTimeString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hình thức:</span>
                <span className="font-semibold text-primary">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2 py-1 border-b border-dashed border-slate-300">
              <div className="grid grid-cols-12 text-[10px] font-bold text-muted-foreground pb-1 border-b border-slate-100">
                <span className="col-span-6">TÊN MẶT HÀNG</span>
                <span className="col-span-2 text-center">SL</span>
                <span className="col-span-4 text-right">THÀNH TIỀN</span>
              </div>

              {order.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 items-center text-xs py-0.5">
                  <div className="col-span-6 pr-1">
                    <div className="font-semibold truncate">{item.product.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatCurrency(item.price)}/{item.unitName}
                    </div>
                  </div>
                  <div className="col-span-2 text-center font-bold">
                    {item.quantity}
                  </div>
                  <div className="col-span-4 text-right font-bold">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calculations */}
            <div className="space-y-1 text-xs pt-1 pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Chiết khấu:</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}

              {order.taxAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Thuế VAT ({order.taxRate}%):</span>
                  <span>+{formatCurrency(order.taxAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-slate-200 text-slate-900">
                <span>TỔNG THANH TOÁN:</span>
                <span className="text-base text-primary">
                  {formatCurrency(order.total)}
                </span>
              </div>

              {order.paymentMethod === "cash" && (
                <>
                  <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Khách đưa:</span>
                    <span>{formatCurrency(order.customerMoney)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>Tiền thối lại:</span>
                    <span className="text-emerald-700">
                      {formatCurrency(order.changeMoney)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Footer note */}
            <div className="text-center pt-2 space-y-1 text-[11px] text-muted-foreground">
              <p className="font-medium text-slate-700">
                Cảm ơn quý khách và hẹn gặp lại!
              </p>
              <p className="text-[9px]">
                Quý khách vui lòng kiểm tra hóa đơn trước khi rời quầy.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-2 no-print">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewOrder}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <PlusCircle className="size-3.5" />
            Đơn hàng mới
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs gap-1.5 cursor-pointer bg-primary hover:bg-primary/90"
          >
            <Printer className="size-3.5" />
            In hóa đơn (K80)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
