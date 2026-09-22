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
    <ContentLayout title="Đơn vị tính" className="flex-1 min-h-0">
      <div className="flex-1 min-h-0 flex flex-col space-y-1.5 sm:space-y-2 overflow-hidden">
        <div className="flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-700 sm:hidden">
            Danh sách đơn vị
          </span>
          <div className="ml-auto">
            <CreateUnit />
          </div>
        </div>
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <UnitsList />
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default UnitRoute;
