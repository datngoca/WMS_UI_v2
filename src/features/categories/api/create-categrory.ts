import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/lib/api-client";
import { type MutationConfig } from "@/lib/react-query";
import { type ApiResponse } from "@/types/api";

import { getCategoriesQueryOptions } from "./get-categories";

export const createCategoryInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  parentId: z.number().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

type CategoryRequest = {
  name: string;
  descriptipon: string;
  parentId: number;
};

export const createCategory = ({
  data,
}: {
  data: CreateCategoryInput;
}): Promise<ApiResponse<CategoryRequest>> => api.post(`/categories`, data);

type UseCreateCategoryOptions = {
  mutationConfig?: MutationConfig<typeof createCategory>;
};

export const useCreateCategory = ({
  mutationConfig,
}: UseCreateCategoryOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getCategoriesQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createCategory,
  });
};
