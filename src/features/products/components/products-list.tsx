import * as React from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Layers,
  Calendar,
  Tag,
  SlidersHorizontal,
  Search,
  Eye,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { paths } from "@/config/paths";
import { type Product } from "@/types/api";
import { formatCurrency, formatDate, stripHtml } from "@/utils/format";

import { useProducts } from "../api/get-products";
import { ProductView } from "./product-view";
import { UpdateProduct } from "./update-product";

export type ProductsListProps = {
  onProductPrefetch?: (id: number) => void;
};

export const ProductList = ({ onProductPrefetch }: ProductsListProps = {}) => {
  const [searchParams] = useSearchParams();
  const page = +(searchParams.get("page") || 1);
  const [searchTerm, setSearchTerm] = React.useState("");

  const productsQuery = useProducts({
    page,
  });

  if (productsQuery.isLoading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3 bg-white rounded-xl border border-slate-200/80">
        <Spinner size="lg" />
        <span className="text-xs text-muted-foreground">Đang tải danh sách sản phẩm...</span>
      </div>
    );
  }

  const allProducts = productsQuery.data?.data || [];
  const meta = productsQuery.data?.meta;

  // Local search filter by name or SKU
  const filteredProducts = searchTerm
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : allProducts;

  return (
    <div className="flex flex-col min-h-0 space-y-1.5 sm:space-y-3 flex-1 overflow-hidden">
      {/* Top filter / search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-2 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-2xs shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc mã SKU..."
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-muted-foreground">
          <span>Tổng số:</span>
          <Badge variant="secondary" className="font-semibold text-slate-900">
            {meta?.total ?? allProducts.length} sản phẩm
          </Badge>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Table<Product>
          data={filteredProducts}
          columns={[
            {
              title: "SẢN PHẨM & MÃ SKU",
              field: "name",
              Cell({ entry }) {
                return (
                  <div
                    className="flex items-center gap-3 min-w-[220px]"
                    onMouseEnter={() => onProductPrefetch?.(entry.id)}
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <Package className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs text-slate-900 line-clamp-1">
                        {entry.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] text-muted-foreground bg-slate-100 px-1.5 py-0.2 rounded">
                          {entry.sku}
                        </span>
                        {entry.description && (
                          <span
                            className="text-[11px] text-muted-foreground/80 truncate max-w-[180px]"
                            title={stripHtml(entry.description)}
                          >
                            • {stripHtml(entry.description)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              },
            },
            {
              title: "DANH MỤC",
              field: "categories",
              Cell({ entry: { categories } }) {
                if (!categories || categories.length === 0) {
                  return (
                    <span className="text-xs text-muted-foreground/60 italic">
                      Chưa gắn
                    </span>
                  );
                }

                return (
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {categories.slice(0, 2).map((cat) => (
                      <Badge
                        key={cat.id}
                        variant="secondary"
                        className="text-[11px] font-normal px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        <Tag className="size-2.5 mr-1 text-slate-400" />
                        {cat.name}
                      </Badge>
                    ))}
                    {categories.length > 2 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 text-muted-foreground"
                      >
                        +{categories.length - 2}
                      </Badge>
                    )}
                  </div>
                );
              },
            },
            {
              title: "ĐƠN VỊ & GIÁ BÁN",
              field: "productUnits",
              Cell({ entry: { productUnits } }) {
                const baseUnit =
                  productUnits?.find((u) => u.isBaseUnit) || productUnits?.[0];

                if (!baseUnit) {
                  return (
                    <span className="text-xs text-muted-foreground/60 italic">
                      Chưa đặt giá
                    </span>
                  );
                }

                return (
                  <div className="flex flex-col text-xs min-w-[140px]">
                    <span className="font-bold text-slate-900 text-xs">
                      {formatCurrency(baseUnit.price)}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                      <span>ĐV: {baseUnit.unit?.name || "Cơ bản"}</span>
                      {productUnits && productUnits.length > 1 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 border-slate-200 text-emerald-700 bg-emerald-50/60"
                        >
                          +{productUnits.length - 1} quy đổi
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              title: "QUY CÁCH / BIẾN THỂ",
              field: "specs",
              hideOnMobile: true,
              Cell({ entry: { specs, options, productUnits } }) {
                const totalUnits = productUnits?.length || 0;
                const totalSpecs = specs?.length || 0;
                const totalOptions = options?.length || 0;

                return (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    {totalUnits > 0 && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px]"
                        title={`${totalUnits} đơn vị tính`}
                      >
                        <Layers className="size-3 text-slate-400" />
                        {totalUnits} ĐV
                      </span>
                    )}
                    {totalOptions > 0 && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px]"
                        title={`${totalOptions} nhóm tùy chọn`}
                      >
                        <SlidersHorizontal className="size-3 text-slate-400" />
                        {totalOptions} Tùy chọn
                      </span>
                    )}
                    {totalSpecs > 0 && totalOptions === 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {totalSpecs} thông số
                      </span>
                    )}
                    {totalUnits === 0 && totalOptions === 0 && totalSpecs === 0 && (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </div>
                );
              },
            },
            {
              title: "NGÀY TẠO",
              field: "createdAt",
              hideOnMobile: true,
              Cell({ entry: { createdAt } }) {
                return (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                    <Calendar className="size-3 text-muted-foreground/60" />
                    <span>{formatDate(createdAt)}</span>
                  </div>
                );
              },
            },
            {
              title: "THAO TÁC",
              field: "id",
              isActionColumn: true,
              Cell({ entry }) {
                return (
                  <div className="flex items-center gap-1">
                    <ProductView
                      product={entry}
                      triggerButton={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 cursor-pointer inline-flex items-center gap-1"
                          title="Xem chi tiết sản phẩm"
                        >
                          <Eye className="size-3.5" />
                          <span>Xem</span>
                        </Button>
                      }
                    />
                    <UpdateProduct
                      productId={entry.id}
                      initialProduct={entry}
                    />
                  </div>
                );
              },
            },
          ]}
          pagination={
            meta && {
              totalPages: Math.ceil(meta.total / meta.size) || 1,
              currentPage: meta.page,
              rootUrl: paths.app.product.getHref(),
            }
          }
        />
        </div>
      </div>
    </div>
  );
};
