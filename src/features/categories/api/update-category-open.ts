import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { MutationConfig } from "@/lib/react-query";

export const updateCategoryOpen = ({
  categoryId,
  isOpen,
}: {
  categoryId: number;
  isOpen: boolean;
}): Promise<ApiResponse<void>> => {
  return api.patch(`/categories/${categoryId}/open`, isOpen, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

type UseUpdateCategoryOpenOptions = {
  mutationConfig?: MutationConfig<typeof updateCategoryOpen>;
};

export const useUpdateCategoryOpen = ({
  mutationConfig,
}: UseUpdateCategoryOpenOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      // Note: We don't refetch the whole categories tree on every expand/collapse click
      // because local expandedIds already maintains UI state instantly.
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateCategoryOpen,
  });
};
