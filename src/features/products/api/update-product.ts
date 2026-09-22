import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type MutationConfig } from "@/lib/react-query";
import { type ApiResponse, type Product } from "@/types/api";

import { createProductInputSchema, type CreateProductInput } from "./create-product";
import { getProductsQueryOptions } from "./get-products";
import { getProductQueryOptions } from "./get-product";

export const updateProductInputSchema = createProductInputSchema;

export type UpdateProductInput = CreateProductInput;

export const updateProduct = ({
  productId,
  data,
}: {
  productId: number;
  data: UpdateProductInput;
}): Promise<ApiResponse<Product>> => {
  return api.put(`/products/${productId}`, data);
};

type UseUpdateProductOptions = {
  mutationConfig?: MutationConfig<typeof updateProduct>;
};

export const useUpdateProduct = ({
  mutationConfig,
}: UseUpdateProductOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getProductsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getProductQueryOptions(variables.productId).queryKey,
      });
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: updateProduct,
  });
};
