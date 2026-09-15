import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { ApiResponse, Unit } from "@/types/api";

import { getUnitsQueryOptions } from "./get-units";

export const updateUnitInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().nullable(),
});

export type UpdateUnitInput = z.infer<typeof updateUnitInputSchema>;

export const updateUnit = ({
  data,
  unitId,
}: {
  data: UpdateUnitInput;
  unitId: number;
}): Promise<ApiResponse<Unit>> => api.patch(`/units/${unitId}`, data);

type UseUpdateUnitOptions = {
  mutationConfig?: MutationConfig<typeof updateUnit>;
};

export const useUpdateUnit = ({
  mutationConfig,
}: UseUpdateUnitOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getUnitsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateUnit,
  });
};