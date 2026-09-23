import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type QueryConfig } from "@/lib/react-query";
import type { ApiResponse } from "@/types/api";
import type { Order } from "../types";

export const getOrders = ({
  page = 1,
  size = 10,
}: {
  page?: number;
  size?: number;
} = {}): Promise<ApiResponse<Order[]>> =>
  api.get(`/orders?page=${page}&size=${size}`);

export const getOrdersQueryOptions = ({
  page = 1,
  size = 10,
}: {
  page?: number;
  size?: number;
} = {}) =>
  queryOptions({
    queryKey: ["orders", { page, size }],
    queryFn: () => getOrders({ page, size }),
  });

type UseOrdersOptions = {
  page?: number;
  size?: number;
  queryConfig?: QueryConfig<typeof getOrdersQueryOptions>;
};

export const useOrders = ({ queryConfig, page, size }: UseOrdersOptions = {}) => {
  return useQuery({
    ...getOrdersQueryOptions({ page, size }),
    ...queryConfig,
  });
};
