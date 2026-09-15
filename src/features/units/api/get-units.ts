import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";
import type { ApiResponse, Unit } from "@/types/api";

export const getUnits = ({
  page = 1,
  size = 5,
}: {
  page?: number;
  size?: number;
} = {}):Promise<ApiResponse<Unit[]>> => api.get(`/units?page=${page}&size=${size}`);

export const getUnitsQueryOptions = ({
  page = 1,
  size = 5,
}: {
  page?: number;
  size?: number;
} = {}) =>
  queryOptions({
    queryKey: ["units", { page, size }],
    queryFn: () => getUnits({ page, size }),
  });

type UseUnitsOptions = {
  page?: number;
  size?: number;
  queryConfig?: QueryConfig<typeof getUnitsQueryOptions>;
}

export const useUnits = (options: UseUnitsOptions = {}) => {
    return useQuery({
        ...getUnitsQueryOptions({page: options.page, size: options.size}),
        ...options.queryConfig,
    });
};