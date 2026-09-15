import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { Link } from "@/components/ui/link";
import { Spinner } from "@/components/ui/spinner";
import { Table } from "@/components/ui/table";

import { useProducts } from "../api/get-products";

export type ProductsListProps = {
  onProductPrefetch?: (id: number) => void;
};

export const ProductList = () => {
  const [searchParams] = useSearchParams();
  const productsQuery = useProducts({
    page: +(searchParams.get("page") || 1),
  });
  const queryClient = useQueryClient();

  if (productsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const products = productsQuery.data?.data;
  const meta = productsQuery.data?.meta;

  if (!products) return null;
  return (
    <Table
      data={products}
      columns={[
        {
          title: "SẢN PHẨM & MÃ SKU",
          field: "id",
          Cell({ entry: { name, sku } }) {
            return (
              <div className="flex flex-col min-w-0 text-sm">
                <div className="flex items-center gap-2">
                  <span className="">{name}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-label-sm text-label-sm text-muted">
                    {sku}
                  </span>
                  <span className="text-muted/40">•</span>
                  <span className="font-label-sm text-label-sm text-muted">
                    BAR: 893501234901
                  </span>
                </div>
              </div>
            );
          },
        },
        {
          title: "Gía cơ sở",
          field: "basePrice",
          Cell({ entry: {productUnits} }) {
            return (
              <div className="flex flex-col min-w-0 text-sm">
                <div className="flex items-center gap-2">
                  <span className="">
                    {productUnits?.find((unit) => unit.isBaseUnit)?.price}
                  </span>
                </div>
              </div>
            );
          },
        },
      ]}
    />
  );
};
