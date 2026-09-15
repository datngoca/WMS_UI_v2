import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/lib/api-client";
import type { ApiResponse, Category } from "@/types/api";

import type { MutationConfig } from "@/lib/react-query";
import { getCategoriesQueryOptions } from "./get-categories";
import { getCategoryQueryOptions } from "./get-category";

export const updateCategoryInputSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  parentId: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    },
    z.number().nullable().optional(),
  ),
});

export type updateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

export const updateCategory = ({
  data,
  categoryId,
}: {
  data: updateCategoryInput;
  categoryId: number;
}): Promise<ApiResponse<Category>> => {
  return api.patch(`/categories/${categoryId}`, data);
};

type UseUpdateCategoryOptions = {
  mutationConfig?: MutationConfig<typeof updateCategory>;
};

export const useUpdateCategory = ({
  mutationConfig,
}: UseUpdateCategoryOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getCategoryQueryOptions(data.data.id).queryKey,
      });
      queryClient.refetchQueries({
        queryKey: getCategoriesQueryOptions().queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateCategory,
  });
};
