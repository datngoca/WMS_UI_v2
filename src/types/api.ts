export type Meta = {
  page: number;
  size: number;
  total: number;
};
export type ApiResponse<T> = {
  message: string;
  data: T;
  meta: Meta;
  code: string;
};
export type BaseEntity = {
  id: number;
  createdAt: string;
  updateAt: string;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

export type Role = Entity<{
  name: string;
  description: string;
}>;

export type User = Entity<{
  username: string;
  email: string;
  fullName: string;
  activate: boolean;
  roles: Role[];
}>;

export type AuthResponse = {
  jwt: string;
  user: User;
};

export type Category = Entity<{
  name: string;
  slug: string;
  description: string;
  parent: {
    id: string;
    name: string;
  };
  children: Category[];
}>;
