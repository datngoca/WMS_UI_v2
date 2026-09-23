import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Receipt,
  Search,
  CheckCircle2,
  Ban,
  Clock,
  Eye,
  TrendingUp,
  Package,
  Calendar,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, type TableColumn } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { paths } from "@/config/paths";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

import type { Order, OrderStatus } from "../types";
import { useOrders } from "../api/get-orders";
import { OrderDetailDrawer } from "./order-detail-drawer";

type FilterStatus = "ALL" | OrderStatus;

const statusBadges: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  CONFIRMED: {
    label: "Đã hoàn tất",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    icon: <CheckCircle2 className="size-3" />,
  },
  PENDING: {
    label: "Chờ xác nhận",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    icon: <Clock className="size-3" />,
  },
  CANCELLED: {
    label: "Đã hủy đơn",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/80",
    icon: <Ban className="size-3" />,
  },
};

export const OrdersView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = +(searchParams.get("page") || 1);
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<FilterStatus>("ALL");
  const [selectedOrderId, setSelectedOrderId] = React.useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const ordersQuery = useOrders({
    page,
    size: pageSize,
  });

  const orders = ordersQuery.data?.data || [];
  const meta = ordersQuery.data?.meta;

  // Lọc theo search và trạng thái
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchSearch = searchTerm
        ? (order.orderCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerPhone || "").includes(searchTerm)
        : true;

      const matchStatus =
        selectedStatus === "ALL" ? true : order.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, selectedStatus]);

  // Thống kê nhanh
  const stats = React.useMemo(() => {
    const totalCount = meta?.total || orders.length;
    const completedOrders = orders.filter((o) => o.status === "CONFIRMED");
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalCount,
      revenue: totalRevenue,
      cancelledCount: cancelledOrders.length,
    };
  }, [orders, meta]);

  const handleOpenDetail = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsDrawerOpen(true);
  };

  // Định nghĩa các cột cho Table component
  const columns: TableColumn<Order>[] = [
    {
      title: "Mã đơn hàng",
      field: "orderCode",
      Cell: ({ entry }: { entry: Order }) => (
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Receipt className="size-4" />
          </div>
          <div>
            <button
              type="button"
              onClick={() => handleOpenDetail(entry.id)}
              className="font-mono font-semibold text-slate-900 hover:text-primary transition-colors text-left text-xs cursor-pointer"
            >
              {entry.orderCode}
            </button>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(entry.createdAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      field: "customerName",
      Cell: ({ entry }: { entry: Order }) => (
        <div>
          <div className="font-medium text-slate-900 text-xs">
            {entry.customerName || "Khách lẻ tại quầy"}
          </div>
          {entry.customerPhone && (
            <div className="text-[11px] text-muted-foreground font-mono">
              {entry.customerPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      field: "items",
      Cell: ({ entry }: { entry: Order }) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Package className="size-3.5 text-slate-400" />
          <span>{entry.items?.length || 0} món</span>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      field: "totalAmount",
      Cell: ({ entry }: { entry: Order }) => (
        <span className="font-mono font-semibold text-slate-900 text-xs">
          {formatCurrency(entry.totalAmount)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      field: "status",
      Cell: ({ entry }: { entry: Order }) => {
        const badge = statusBadges[entry.status] || statusBadges.PENDING;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border",
              badge.bg,
              badge.text,
              badge.border,
            )}
          >
            {badge.icon}
            {badge.label}
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      field: "id",
      isActionColumn: true,
      className: "text-right",
      Cell: ({ entry }: { entry: Order }) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenDetail(entry.id)}
            className="h-7 px-2.5 text-xs gap-1 border-slate-200 hover:border-primary/50 text-slate-700"
          >
            <Eye className="size-3.5 text-slate-500" />
            Chi tiết
          </Button>
        </div>
      ),
    },
  ];

  // Mobile card render
  const renderMobileCard = (order: Order) => {
    const badge = statusBadges[order.status] || statusBadges.PENDING;
    return (
      <div
        key={order.id}
        className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Receipt className="size-4" />
            </div>
            <div>
              <span className="font-mono font-bold text-xs text-slate-900 block">
                {order.orderCode}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" />
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
              badge.bg,
              badge.text,
              badge.border,
            )}
          >
            {badge.icon}
            {badge.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
          <div>
            <span className="text-[10px] text-muted-foreground block">Khách hàng:</span>
            <span className="font-medium text-slate-800 line-clamp-1">
              {order.customerName || "Khách lẻ"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground block">Tổng tiền:</span>
            <span className="font-mono font-bold text-primary">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Package className="size-3 text-slate-400" />
            {order.items?.length || 0} sản phẩm
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenDetail(order.id)}
            className="h-7 px-2.5 text-xs gap-1"
          >
            <Eye className="size-3.5" />
            Xem chi tiết
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3 overflow-hidden">
      {/* Drawer xem chi tiết */}
      {selectedOrderId && (
        <OrderDetailDrawer
          orderId={selectedOrderId}
          isOpen={isDrawerOpen}
          onOpenChange={(open) => {
            setIsDrawerOpen(open);
            if (!open) setSelectedOrderId(null);
          }}
        />
      )}

      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Receipt className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Tổng số đơn hàng
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 font-mono">
              {stats.totalCount}
            </span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Doanh thu trang này
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-600 font-mono">
              {formatCurrency(stats.revenue)}
            </span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Ban className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Đơn đã hủy
            </span>
            <span className="text-base sm:text-lg font-bold text-rose-600 font-mono">
              {stats.cancelledCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
          {/* Status Tabs */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg shrink-0">
            {(
              [
                { key: "ALL", label: "Tất cả" },
                { key: "CONFIRMED", label: "Đã hoàn tất" },
                { key: "CANCELLED", label: "Đã hủy" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatus(tab.key)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap",
                  selectedStatus === tab.key
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Shortcut to POS */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => navigate(paths.app.pos.getHref())}
            className="h-8 text-xs gap-1.5 shrink-0 ml-auto"
          >
            <ShoppingBag className="size-3.5" />
            <span className="hidden sm:inline">Mở quầy</span> POS
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        {ordersQuery.isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <Spinner size="lg" />
            <span className="text-xs text-muted-foreground">
              Đang tải danh sách đơn hàng...
            </span>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <Table<Order>
              data={filteredOrders}
              columns={columns}
              renderMobileCard={renderMobileCard}
              defaultMobileView="table"
              emptyMessage={
                searchTerm || selectedStatus !== "ALL"
                  ? "Không tìm thấy đơn hàng nào phù hợp bộ lọc"
                  : "Chưa có đơn hàng nào trong hệ thống"
              }
              pagination={{
                currentPage: meta?.page || page,
                totalPages: meta ? Math.max(1, Math.ceil(meta.total / (meta.size || pageSize))) : 1,
                rootUrl: paths.app.order.getHref(),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
