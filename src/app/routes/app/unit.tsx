import { QueryClient } from "@tanstack/react-query";

import { ContentLayout } from "@/components/layouts";
import { getUnitsQueryOptions } from "@/features/units/api/get-units";
import { UnitsList } from "@/features/units/components/units-list";
import { CreateUnit } from "@/features/units/components/creat-unit";

export const clientLoader = (queryClient: QueryClient) => async () => {
  const query = getUnitsQueryOptions();
  return queryClient.query(query);
};

const UnitRoute = () => {
  return (
    <ContentLayout title="Units">
      <div className="flex justify-end">
        <CreateUnit />
      </div>
      <UnitsList />
    </ContentLayout>
  );
};

export default UnitRoute;
