import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";

import { getUnitsQueryOptions } from "./get-units";
import type { ApiResponse, Unit } from "@/types/api";

export const deleteUnit = ({
  unitId,
}: {
  unitId: number;
}): Promise<ApiResponse<Unit>> => {
  return api.delete(`/unit/${unitId}`);
};

type UseDeleteUnitOptions = {
  mutationConfig?: MutationConfig<typeof deleteUnit>;
};

export const useDeleteUnit = ({
  mutationConfig,
}: UseDeleteUnitOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...resConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getUnitsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...resConfig,
    mutationFn: deleteUnit,
  });
};
