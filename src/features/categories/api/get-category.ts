import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type {  QueryConfig } from "@/lib/react-query";
import type { ApiResponse, Category } from "@/types/api";

export const getCategory = ({
  categoryId,
}: {
  categoryId: number;
}): Promise<ApiResponse<Category>> => {
  return api.get(`/categories/${categoryId}`);
};

export const getCategoryQueryOptions = (categoryId: number) => {
  return queryOptions({
    queryKey: ["category", categoryId],
    queryFn: () => getCategory({ categoryId }),
  });
};

type UseCategoryOptions = {
  categoryId: number;
  queryConfig?: QueryConfig<typeof getCategoryQueryOptions>;
};

export const useCategory = ({
  categoryId,
  queryConfig,
}: UseCategoryOptions) => {
  return useQuery({
    ...getCategoryQueryOptions(categoryId),
    ...queryConfig,
  });
};
