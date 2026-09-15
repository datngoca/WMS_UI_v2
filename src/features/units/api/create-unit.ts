import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { ApiResponse } from "@/types/api";

import { getUnitsQueryOptions } from "./get-units";

export const createUnitInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().nullable(),
});

export type CreateUnitInput = z.infer<typeof createUnitInputSchema>;

type UnitRequest = {
  name: string;
  code: string;
  description: string;
};

export const createUnit = ({
  data,
}: {
  data: CreateUnitInput;
}): Promise<ApiResponse<UnitRequest>> => api.post(`/units`, data);

type UseCreateUnitOptions = {
  mutationConfig?: MutationConfig<typeof createUnit>;
};

export const useCreateUnit = ({
  mutationConfig,
}: UseCreateUnitOptions = {}) => {
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
    mutationFn: createUnit,
  });
};