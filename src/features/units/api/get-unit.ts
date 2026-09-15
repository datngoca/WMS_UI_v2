import { useQuery, queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { type QueryConfig } from "@/lib/react-query";
import type { ApiResponse, Unit } from "@/types/api";

export const getUnit = ({
  unitId,
}: {
  unitId: number;
}): Promise<ApiResponse<Unit>> => api.get(`/units/${unitId}`);

export const getUnitQueryOptions = (unitId: number) => {
  return queryOptions({
    queryKey: ["units", unitId],
    queryFn: () => getUnit({ unitId }),
  });
};

type UseUnitOptions = {
  unitId: number;
  queryConfig?: QueryConfig<typeof getUnitQueryOptions>;
};

export const useUnit = (options: UseUnitOptions) => {
  return useQuery({
    ...getUnitQueryOptions(options.unitId),
    ...options.queryConfig,
  });
};