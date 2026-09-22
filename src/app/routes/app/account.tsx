import { QueryClient } from "@tanstack/react-query";

import { ContentLayout } from "@/components/layouts";
import { getUsersQueryOptions } from "@/features/users/api/get-users";
import { UsersList } from "@/features/users/components/users-list";

export const clientLoader = (queryClient: QueryClient) => async () => {
  const query = getUsersQueryOptions();
  return queryClient.query(query);
};

const AccountRoute = () => {
  return (
    <ContentLayout title="Tài khoản" className="flex-1 min-h-0">
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <UsersList />
        </div>
      </div>
    </ContentLayout>
  );
};
export default AccountRoute;
