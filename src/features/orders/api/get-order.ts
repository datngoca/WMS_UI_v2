import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type QueryConfig } from "@/lib/react-query";
import type { ApiResponse } from "@/types/api";
import type { Order } from "../types";

export const getOrder = (id: number): Promise<ApiResponse<Order>> =>
  api.get(`/orders/${id}`);

export const getOrderQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
  });

type UseOrderOptions = {
  id: number;
  queryConfig?: QueryConfig<typeof getOrderQueryOptions>;
};

export const useOrder = ({ id, queryConfig }: UseOrderOptions) => {
  return useQuery({
    ...getOrderQueryOptions(id),
    ...queryConfig,
  });
};
