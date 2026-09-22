import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type QueryConfig } from "@/lib/react-query";
import type { ApiResponse, Product } from "@/types/api";

export const getProduct = ({
  productId,
}: {
  productId: number;
}): Promise<ApiResponse<Product>> => {
  return api.get(`/products/${productId}`);
};

export const getProductQueryOptions = (productId: number) => {
  return queryOptions({
    queryKey: ["products", productId],
    queryFn: () => getProduct({ productId }),
  });
};

type UseProductOptions = {
  productId: number;
  queryConfig?: QueryConfig<typeof getProductQueryOptions>;
};

export const useProduct = ({ productId, queryConfig }: UseProductOptions) => {
  return useQuery({
    ...getProductQueryOptions(productId),
    ...queryConfig,
    enabled: Boolean(productId),
  });
};