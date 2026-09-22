import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "./table";
import { type User } from "@/types/api";
import { Edit, Eye, Trash } from "lucide-react";
import { Button } from "../button";

const meta: Meta<typeof Table> = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
  argTypes: {
    // Thêm các props của component tại đây
  },
};

export default meta;

type Story = StoryObj<typeof Table<User>>;

const data: User[] = [
  {
    id: 1,
    username: "admin",
    email: "[EMAIL_ADDRESS]",
    fullName: "Admin",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
  {
    id: 2,
    username: "user",
    email: "[EMAIL_ADDRESS]",
    fullName: "User",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
  {
    id: 3,
    username: "user",
    email: "[EMAIL_ADDRESS]",
    fullName: "User",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
  {
    id: 4,
    username: "user",
    email: "[EMAIL_ADDRESS]",
    fullName: "User",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
  {
    id: 5,
    username: "user",
    email: "[EMAIL_ADDRESS]",
    fullName: "User",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
  {
    id: 6,
    username: "user",
    email: "[EMAIL_ADDRESS]",
    fullName: "User",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
  {
    id: 7,
    username: "user",
    email: "[EMAIL_ADDRESS]",
    fullName: "User",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
  {
    id: 8,
    username: "user",
    email: "[EMAIL_ADDRESS]",
    fullName: "User",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
  {
    id: 9,
    username: "user",
    email: "[EMAIL_ADDRESS]",
    fullName: "User",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
  {
    id: 10,
    username: "user",
    email: "[EMAIL_ADDRESS]",
    fullName: "User",
    activate: true,
    roles: [],
    createdAt: "2022-01-01",
    updateAt: "2022-01-01",
  },
];

export const DefaultUserTable: Story = {
  args: {
    data,
    columns: [
      {
        title: "ID",
        field: "id",
      },
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
        title: "Activate",
        field: "activate",
      },
      {
        title: "Roles",
        field: "roles",
      },
      {
        title: "Created At",
        field: "createdAt",
      },
      {
        title: "Update At",
        field: "updateAt",
      },
      {
        title: "Actions",
        field: "id",
        Cell: () => {
          return (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Eye className="size-4" />
              </Button>
              <Button variant="secondary" size="sm">
                <Edit className="size-4" />
              </Button>
              <Button variant="destructive" size="sm">
                <Trash className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      rootUrl: "#",
    },
  },
};
