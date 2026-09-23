import * as React from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Boxes,
  Plus,
  Minus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, type TableColumn } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { paths } from "@/config/paths";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

import type { InventoryItem } from "../types";
import { useInventory } from "../api/get-inventory";
import { StockModal } from "./stock-modal";

type FilterStockStatus = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export const InventoryView = () => {
  const [searchParams] = useSearchParams();
  const page = +(searchParams.get("page") || 1);
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = React.useState("");
  const [stockFilter, setStockFilter] = React.useState<FilterStockStatus>("ALL");

  // State cho Modal Nhập/Xuất kho
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"in" | "out">("in");
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(
    null,
  );

  const inventoryQuery = useInventory({
    page,
    size: pageSize,
  });

  const inventoryList = inventoryQuery.data?.data || [];
  const meta = inventoryQuery.data?.meta;

  // Lọc sản phẩm
  const filteredList = React.useMemo(() => {
    return inventoryList.filter((item) => {
      const matchSearch = searchTerm
        ? (item.productName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (item.productSku || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      let matchFilter = true;
      if (stockFilter === "IN_STOCK") {
        matchFilter = item.quantity > 5;
      } else if (stockFilter === "LOW_STOCK") {
        matchFilter = item.quantity > 0 && item.quantity <= 5;
      } else if (stockFilter === "OUT_OF_STOCK") {
        matchFilter = item.quantity === 0;
      }

      return matchSearch && matchFilter;
    });
  }, [inventoryList, searchTerm, stockFilter]);

  // Thống kê nhanh
  const stats = React.useMemo(() => {
    const totalItems = meta?.total || inventoryList.length;
    const totalQuantity = inventoryList.reduce(
      (sum, i) => sum + (i.quantity || 0),
      0,
    );
    const lowStockCount = inventoryList.filter(
      (i) => i.quantity <= 5 && i.quantity > 0,
    ).length;
    const outOfStockCount = inventoryList.filter(
      (i) => i.quantity === 0,
    ).length;

    return {
      totalItems,
      totalQuantity,
      warningCount: lowStockCount + outOfStockCount,
    };
  }, [inventoryList, meta]);

  const handleOpenModal = (mode: "in" | "out", item?: InventoryItem) => {
    setModalMode(mode);
    setSelectedItem(item || null);
    setIsModalOpen(true);
  };

  const columns: TableColumn<InventoryItem>[] = [
    {
      title: "Sản phẩm",
      field: "productName",
      Cell: ({ entry }: { entry: InventoryItem }) => (
        <div className="flex items-center gap-3">
          <div className="relative size-12 rounded-xl border border-slate-200/80 bg-slate-50 p-1 shrink-0 flex items-center justify-center overflow-hidden">
            {entry.productImageUrl ? (
              <img
                src={entry.productImageUrl}
                alt={entry.productName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="size-full flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="size-5" />
              </div>
            )}
          </div>
          <div>
            <span className="font-semibold text-xs text-slate-900 line-clamp-1 block">
              {entry.productName}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              SKU: {entry.productSku}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng tồn kho",
      field: "quantity",
      Cell: ({ entry }: { entry: InventoryItem }) => {
        const isOutOfStock = entry.quantity === 0;
        const isLowStock = entry.quantity > 0 && entry.quantity <= 5;

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-slate-900">
              {entry.quantity}
            </span>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="size-2.5" />
                Hết hàng
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="size-2.5" />
                Sắp hết
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="size-2.5" />
                Còn hàng
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Cập nhật",
      field: "updatedAt",
      Cell: ({ entry }: { entry: InventoryItem }) => (
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Calendar className="size-3" />
          {formatDate(entry.updatedAt)}
        </span>
      ),
    },
    {
      title: "Thao tác",
      field: "id",
      isActionColumn: true,
      className: "text-right",
      Cell: ({ entry }: { entry: InventoryItem }) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal("in", entry)}
            className="h-7 px-2 text-xs gap-1 border-emerald-200 hover:bg-emerald-50 text-emerald-700 cursor-pointer"
            title="Nhập thêm hàng"
          >
            <Plus className="size-3.5" />
            <span>Nhập</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal("out", entry)}
            disabled={entry.quantity === 0}
            className="h-7 px-2 text-xs gap-1 border-rose-200 hover:bg-rose-50 text-rose-700 cursor-pointer disabled:opacity-40"
            title="Xuất bớt hàng"
          >
            <Minus className="size-3.5" />
            <span>Xuất</span>
          </Button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (item: InventoryItem) => {
    const isOutOfStock = item.quantity === 0;
    const isLowStock = item.quantity > 0 && item.quantity <= 5;

    return (
      <div
        key={item.id}
        className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
              {item.productImageUrl ? (
                <img
                  src={item.productImageUrl}
                  alt={item.productName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="size-5 text-primary" />
              )}
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-900 block line-clamp-1">
                {item.productName}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                SKU: {item.productSku}
              </span>
            </div>
          </div>

          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
              Hết hàng
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              Sắp hết
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Còn hàng
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Tồn kho</span>
            <span className="font-mono font-bold text-sm text-slate-900">
              {item.quantity} sản phẩm
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenModal("in", item)}
              className="h-7 px-2 text-xs border-emerald-200 text-emerald-700"
            >
              <Plus className="size-3" />
              Nhập
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenModal("out", item)}
              disabled={item.quantity === 0}
              className="h-7 px-2 text-xs border-rose-200 text-rose-700"
            >
              <Minus className="size-3" />
              Xuất
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3 overflow-hidden">
      {/* Modal Nhập/Xuất kho */}
      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        selectedItem={selectedItem}
      />

      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Boxes className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Tổng mặt hàng quản lý
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 font-mono">
              {stats.totalItems}
            </span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Tổng tồn kho hiện hành
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-600 font-mono">
              {stats.totalQuantity}
            </span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Cảnh báo thiếu / hết hàng
            </span>
            <span className="text-base sm:text-lg font-bold text-amber-600 font-mono">
              {stats.warningCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
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
                { key: "IN_STOCK", label: "Còn hàng" },
                { key: "LOW_STOCK", label: "Sắp hết" },
                { key: "OUT_OF_STOCK", label: "Hết hàng" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStockFilter(tab.key)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap",
                  stockFilter === tab.key
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => handleOpenModal("in")}
            className="h-8 text-xs gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <ArrowDownToLine className="size-3.5" />
            <span>Nhập kho</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal("out")}
            className="h-8 text-xs gap-1.5 shrink-0 border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
          >
            <ArrowUpFromLine className="size-3.5" />
            <span>Xuất kho</span>
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        {inventoryQuery.isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <Spinner size="lg" />
            <span className="text-xs text-muted-foreground">
              Đang tải danh sách tồn kho...
            </span>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <Table<InventoryItem>
              data={filteredList}
              columns={columns}
              renderMobileCard={renderMobileCard}
              defaultMobileView="table"
              emptyMessage={
                searchTerm || stockFilter !== "ALL"
                  ? "Không tìm thấy mặt hàng nào phù hợp bộ lọc"
                  : "Chưa có dữ liệu tồn kho nào"
              }
              pagination={{
                currentPage: meta?.page || page,
                totalPages: meta
                  ? Math.max(1, Math.ceil(meta.total / (meta.size || pageSize)))
                  : 1,
                rootUrl: paths.app.inventory.getHref(),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
