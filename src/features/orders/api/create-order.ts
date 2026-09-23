import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type MutationConfig } from "@/lib/react-query";
import { type ApiResponse } from "@/types/api";
import { useNotifications } from "@/components/ui/notifications";
import type { Order, OrderCreateRequest } from "../types";

export const createOrder = ({
  data,
}: {
  data: OrderCreateRequest;
}): Promise<ApiResponse<Order>> => api.post("/orders", data);

type UseCreateOrderOptions = {
  mutationConfig?: MutationConfig<typeof createOrder>;
};

export const useCreateOrder = ({
  mutationConfig,
}: UseCreateOrderOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      addNotification({
        type: "success",
        title: "Thanh toán thành công!",
        message: `Đơn hàng ${data.data?.orderCode || ""} đã được lưu và trừ kho thành công`,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createOrder,
  });
};
