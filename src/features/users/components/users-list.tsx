import { Spinner } from "@/components/ui/spinner";

import { useUsers } from "../api/get-users";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { paths } from "@/config/paths";
import { useSearchParams } from "react-router-dom";

export const UsersList = () => {
  const [searchParams] = useSearchParams();
  const page = +(searchParams.get("page") || 1);
  const usersQuery = useUsers({ page, size: 5 });
  if (usersQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const users = usersQuery.data?.data;
  const meta = usersQuery.data?.meta;
  
  if (!users) return null;

  return (
    <Table
      data={users}
      columns={[
        {
          title: "Username",
          field: "username",
        },
        {
          title: "Email",
          field: "email",
        },
        {
          title: "Full Name",
          field: "fullName",
        },
        {
          title: "Active",
          field: "activate",
          Cell({ entry: { activate } }) {
            return <span>{activate ? "Yes" : "No"}</span>;
          },
        },
        {
          title: "Role",
          field: "roles",
          Cell({ entry: { roles } }) {
            return <span>{roles?.map((role) => role.name).join(", ")}</span>;
          },
        },
        {
          title: "Actions",
          field: "id",
          Cell() {
            return <Button>Edit</Button>;
          },
        },
      ]}
      pagination={
        meta && {
          totalPages: Math.ceil(meta.total / meta.size),
          currentPage: meta.page,
          rootUrl: paths.app.account.getHref(),
        }
      }
    />
  );
};
