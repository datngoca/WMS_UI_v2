import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/lib/api-client";
import { type MutationConfig } from "@/lib/react-query";
import { type ApiResponse } from "@/types/api";

import { getProductsQueryOptions } from "./get-products";

export const createProductInputSchema = z.object({
    sku: z.string().optional(),
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    categories: z.array(z.coerce.number()).optional(),
    productUnits: z.array(
        z.object({
            sku: z.string().optional(),
            barcode: z.string().optional(),
            imageUrl: z.string().optional(),
            exchangeValue: z.number(),
            price: z.number(),
            unitId: z.number(),
            isBaseUnit: z.boolean(),
        })
    ),
    specs: z.array(
        z.object({
            label: z.string(),
            value: z.string(),
        })
    ),
    options: z.array(
        z.object({
            name: z.string(),
            type: z.string(),
            values: z.array(
                z.object({
                    label: z.string(),
                    value: z.string(),
                })
            ),
        })
    ),
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

type ProductRequest = {
    sku?: string;
    name: string;
    description: string;
    imageUrl?: string;
    categories: Array<{
        id: number;
    }>;
    specs: Array<{
        label: string;
        value: string;
    }>;
    options: Array<{
        name: string;
        type: string;
        values: Array<{
            label: string;
            value: string;
        }>;
    }>;
    productUnits: Array<{
        barcode: string;
        name: string;
        price: number;
        sku?: string;
        imageUrl?: string;
        unitId: number;
        isBaseUnit: boolean;
        exchangeValue: number;
    }>;
};

export const generateSku = ({
    name,
}: {
    name?: string;
}): Promise<ApiResponse<{ sku: string }>> =>
    api.get(`/products/generate-sku`, {
        params: { name },
    });

export const createProduct = ({
    data,
}: {
    data: CreateProductInput;
}): Promise<ApiResponse<ProductRequest>> => api.post(`/products`, data);

type UseCreateProductOptions = {
    mutationConfig?: MutationConfig<typeof createProduct>;
};

export const useCreateProduct = ({
    mutationConfig,
}: UseCreateProductOptions = {}) => {
    const queryClient = useQueryClient();

    const { onSuccess, ...restConfig } = mutationConfig || {};

    return useMutation({
        onSuccess: (...args) => {
            queryClient.invalidateQueries({
                queryKey: getProductsQueryOptions().queryKey,
            });
            onSuccess?.(...args);
        },
        ...restConfig,
        mutationFn: createProduct,
    });
};
