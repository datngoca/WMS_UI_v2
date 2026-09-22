export const paths = {
  home: {
    path: "/",
    getHref: () => "/",
  },

  auth: {
    register: {
      path: "/auth/register",
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`,
    },

    login: {
      path: "/auth/login",
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`,
    },
  },
  app: {
    root: {
      path: "/app",
      getHref: () => "/app",
    },
    dashboard: {
      path: "/app/dashboard",
      getHref: () => "/app/dashboard",
    },
    account: {
      path: "/app/accounts",
      getHref: () => "/app/accounts",
    },
    inventory: {
      path: "/app/inventory",
      getHref: () => "/app/inventory",
    },
    product: {
      path: "/app/product",
      getHref: () => "/app/product",
    },
    order: {
      path: "/app/order",
      getHref: () => "/app/order",
    },
    customer: {
      path: "/app/customer",
      getHref: () => "/app/customer",
    },
    profile: {
      path: "/app/profile",
      getHref: () => "/app/profile",
    },
    category: {
      path: "/app/category",
      getHref: () => "/app/category",
    },
    unit: {
      path: "/app/unit",
      getHref: () => "/app/unit",
    },
    pos: {
      path: "/app/pos",
      getHref: () => "/app/pos",
    }
  },
} as const;
