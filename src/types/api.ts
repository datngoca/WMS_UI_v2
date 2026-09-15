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
  timestamp: string;
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

type CategoryRef = {
  id: number;
  name: string;
};

export type Category = Entity<{
  name: string;
  slug: string;
  description: string;
  parent: CategoryRef;
  children: Category[];
}>;

export type Unit = Entity<{
  name: string;
  code: string;
  description: string;
}>;

export type Product = Entity<{
  sku: string;
  name: string;
  categories: CategoryRef[];
  description: string;
  basePrice: number;
  specs: {
    label: string;
    value: string;
  }[];
  detailedSpecs: {
    groupName: string;
    items: { label: string; value: string }[];
  }[];
  options: {
    name: string;
    type: string;
    values: { label: string; value: string }[];
  }[];
  productUnits: {
    id: number;
    unit: Unit;
    exchangeValue: number;
    price: number;
    isBaseUnit: boolean;
  }[];
}>;
