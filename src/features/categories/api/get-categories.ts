import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type QueryConfig } from "@/lib/react-query";
import type { ApiResponse, Category } from "@/types/api";

export const getCategories = (): Promise<ApiResponse<Category[]>> => {
  return api.get("/categories");
};

export const getCategoriesQueryOptions = () => {
  return queryOptions({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
};

type UseCategoriesQueryOptions = {
  queryConfig?: QueryConfig<typeof getCategoriesQueryOptions>;
};

export const useCategories = ({ queryConfig }: UseCategoriesQueryOptions) => {
  return useQuery({
    ...getCategoriesQueryOptions(),
    ...queryConfig,
  });
};
