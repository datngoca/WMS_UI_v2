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
    <ContentLayout title="Account">
      {/* <h1 className="text-xl">Hello Dashboard</h1> */}
      <UsersList />
    </ContentLayout>
  );
};
export default AccountRoute;
