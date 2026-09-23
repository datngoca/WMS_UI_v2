import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { type MutationConfig } from "@/lib/react-query";
import { type ApiResponse } from "@/types/api";
import { useNotifications } from "@/components/ui/notifications";
import type { InventoryActionRequest } from "../types";

export const removeStock = ({
  data,
}: {
  data: InventoryActionRequest;
}): Promise<ApiResponse<void>> => api.post("/inventory/remove", data);

type UseRemoveStockOptions = {
  mutationConfig?: MutationConfig<typeof removeStock>;
};

export const useRemoveStock = ({ mutationConfig }: UseRemoveStockOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      addNotification({
        type: "success",
        title: "Xuất kho thành công!",
        message: "Số lượng tồn kho đã được trừ thành công",
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: removeStock,
  });
};
