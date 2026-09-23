import { QueryClient } from "@tanstack/react-query";

import { ContentLayout } from "@/components/layouts";
import { getInventoryQueryOptions } from "@/features/inventory/api/get-inventory";
import { InventoryView } from "@/features/inventory/components";

export const clientLoader = (queryClient: QueryClient) => async () => {
  const query = getInventoryQueryOptions();
  return queryClient.query(query);
};

const InventoryRoute = () => {
  return (
    <ContentLayout title="Tồn kho" className="flex-1 min-h-0">
      <InventoryView />
    </ContentLayout>
  );
};

export default InventoryRoute;