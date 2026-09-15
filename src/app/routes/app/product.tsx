import { QueryClient } from "@tanstack/react-query";

import { ContentLayout } from "@/components/layouts";
import { getProductsQueryOptions } from "@/features/products/api/get-products";
import { ProductList } from "@/features/products/components/products-list";

export const clientLoader = (queryClient: QueryClient) => async () => {
  const query = getProductsQueryOptions();
  return queryClient.query(query);
};

const ProductRoute = () => {
  return (
    <ContentLayout title="Products">
      {/* <h1 className="text-xl">Hello Dashboard</h1> */}
      <ProductList />
    </ContentLayout>
  );
};
export default ProductRoute;
