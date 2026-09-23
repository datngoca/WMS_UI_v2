import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type MutationConfig } from "@/lib/react-query";
import { type ApiResponse } from "@/types/api";
import { useNotifications } from "@/components/ui/notifications";
import type { Order } from "../types";

export const cancelOrder = ({ id }: { id: number }): Promise<ApiResponse<Order>> =>
  api.put(`/orders/${id}/cancel`);

type UseCancelOrderOptions = {
  mutationConfig?: MutationConfig<typeof cancelOrder>;
};

export const useCancelOrder = ({ mutationConfig }: UseCancelOrderOptions = {}) => {
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
        title: "Thành công",
        message: `Đơn hàng ${data.data?.orderCode || ""} đã được hủy và hoàn lại tồn kho`,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: cancelOrder,
  });
};
