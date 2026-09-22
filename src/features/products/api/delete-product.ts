import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";

import { getProductsQueryOptions } from "./get-products";
import type { ApiResponse, Product } from "@/types/api";

export const deleteProduct = ({
    productId,
}: {
    productId: number;
}): Promise<ApiResponse<Product>> => {
    return api.delete(`/products/${productId}`);
};

type UseDeleteProductOptions = {
    mutationConfig?: MutationConfig<typeof deleteProduct>;
};

export const useDeleteProduct = ({
    mutationConfig,
}: UseDeleteProductOptions = {}) => {
    const queryClient = useQueryClient();

    const { onSuccess, ...resConfig } = mutationConfig || {};

    return useMutation({
        onSuccess: (...args) => {
            queryClient.invalidateQueries({
                queryKey: getProductsQueryOptions().queryKey,
            });
            onSuccess?.(...args);
        },
        ...resConfig,
        mutationFn: deleteProduct,
    });
};