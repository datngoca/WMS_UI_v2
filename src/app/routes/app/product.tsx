import { QueryClient } from "@tanstack/react-query";

import { ContentLayout } from "@/components/layouts";
import { getProductsQueryOptions } from "@/features/products/api/get-products";
import { ProductList } from "@/features/products/components/products-list";
import { CreateProduct } from "@/features/products/components/create-product/create-product";

export const clientLoader = (queryClient: QueryClient) => async () => {
  const query = getProductsQueryOptions();
  return queryClient.query(query);
};

const ProductRoute = () => {
  return (
    <ContentLayout title="Sản phẩm" className="flex-1 min-h-0">
      <div className="flex-1 min-h-0 flex flex-col space-y-1.5 sm:space-y-2 overflow-hidden">
        <div className="flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-700 sm:hidden">
            Danh sách sản phẩm
          </span>
          <div className="ml-auto">
            <CreateProduct />
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <ProductList />
        </div>
      </div>
    </ContentLayout>
  );
};
export default ProductRoute;
