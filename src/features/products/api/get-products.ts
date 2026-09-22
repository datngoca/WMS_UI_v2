import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type QueryConfig } from "@/lib/react-query";
import type { ApiResponse, Product } from "@/types/api";

export const getProducts = ({
  page = 1,
  size = 5,
}: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<Product[]>> =>
  api.get(`/products?page=${page}&size=${size}`);

export const getProductsQueryOptions = ({
  page = 1,
  size = 5,
}: {
  page?: number;
  size?: number;
} = {}) =>
  queryOptions({
    queryKey: page ? ["products", { page, size }] : ["products"],
    queryFn: () => getProducts({ page, size }),
  });

type UseProductsOptions = {
  page?: number;
  size?: number;
  queryConfig?: QueryConfig<typeof getProductsQueryOptions>;
};

export const useProducts = ({ queryConfig, page, size }: UseProductsOptions = {}) => {
  return useQuery({
    ...getProductsQueryOptions({ page, size }),
    ...queryConfig,
  });
};
