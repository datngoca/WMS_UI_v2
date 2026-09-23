import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type QueryConfig } from "@/lib/react-query";
import type { ApiResponse } from "@/types/api";
import type { InventoryItem } from "../types";

export const getInventory = ({
  page = 1,
  size = 10,
}: {
  page?: number;
  size?: number;
} = {}): Promise<ApiResponse<InventoryItem[]>> =>
  api.get(`/inventory?page=${page}&size=${size}`);

export const getInventoryQueryOptions = ({
  page = 1,
  size = 10,
}: {
  page?: number;
  size?: number;
} = {}) =>
  queryOptions({
    queryKey: ["inventory", { page, size }],
    queryFn: () => getInventory({ page, size }),
  });

type UseInventoryOptions = {
  page?: number;
  size?: number;
  queryConfig?: QueryConfig<typeof getInventoryQueryOptions>;
};

export const useInventory = ({ queryConfig, page, size }: UseInventoryOptions = {}) => {
  return useQuery({
    ...getInventoryQueryOptions({ page, size }),
    ...queryConfig,
  });
};
