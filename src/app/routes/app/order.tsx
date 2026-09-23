import { QueryClient } from "@tanstack/react-query";

import { ContentLayout } from "@/components/layouts";
import { getOrdersQueryOptions } from "@/features/orders/api/get-orders";
import { OrdersView } from "@/features/orders/components";

export const clientLoader = (queryClient: QueryClient) => async () => {
  const query = getOrdersQueryOptions();
  return queryClient.query(query);
};

const OrderRoute = () => {
  return (
    <ContentLayout title="Đơn hàng" className="flex-1 min-h-0">
      <OrdersView />
    </ContentLayout>
  );
};

export default OrderRoute;