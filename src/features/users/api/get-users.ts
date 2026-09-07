import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type QueryConfig } from "@/lib/react-query";
import type { ApiResponse, User } from "@/types/api";

export const getUsers = ({
  page = 1,
  size = 5,
}: {
  page?: number;
  size?: number;
} = {}): Promise<ApiResponse<User[]>> => {
  return api.get(`/users?page=${page}&size=${size}`);
};

export const getUsersQueryOptions = ({
  page = 1,
  size = 5,
}: {
  page?: number;
  size?: number;
} = {}) => {
  return queryOptions({
    queryKey: ["users", { page, size }],
    queryFn: () => getUsers({ page, size }),
  });
};

type UseUsersOptions = {
  page?: number;
  size?: number;
  queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
};

export const useUsers = ({ page, size, queryConfig }: UseUsersOptions = {}) => {
  return useQuery({
    ...getUsersQueryOptions({ page, size }),
    ...queryConfig,
  });
};
