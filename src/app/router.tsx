import { useMemo } from "react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { paths } from "@/config/paths";
import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from "./routes/app/root";

const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  };
};

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: paths.auth.register.path,
      lazy: () => import("./routes/auth/register").then(convert(queryClient)),
    },
    {
      path: paths.auth.login.path,
      lazy: () => import("./routes/auth/login").then(convert(queryClient)),
    },
    // {
    //     path:paths.auth.verifyEmail.path,
    //     lazy:()=> import('./routes/auth/verify-email').then(convert(queryClient)),
    // },
    // {
    //     path:paths.auth.forgotPassword.path,
    //     lazy:()=> import('./routes/auth/forgot-password').then(convert(queryClient)),
    // },
    // {
    //     path:paths.auth.resetPassword.path,
    //     lazy:()=> import('./routes/auth/reset-password').then(convert(queryClient)),
    // },
    {
      path: paths.app.root.path,
      element: <AppRoot />,
      children: [
        {
          path: paths.app.dashboard.path,
          lazy: () =>
            import("./routes/app/dashboard").then(convert(queryClient)),
        },
        {
          path: paths.app.account.path,
          lazy: () => import("./routes/app/account").then(convert(queryClient)),
        },
        {
          path: paths.app.product.path,
          lazy: () => import("./routes/app/product").then(convert(queryClient)),
        },
        {
          path: paths.app.inventory.path,
          lazy: () =>
            import("./routes/app/inventory").then(convert(queryClient)),
        },
        {
          path: paths.app.order.path,
          lazy: () => import("./routes/app/order").then(convert(queryClient)),
        },
        {
          path: paths.app.customer.path,
          lazy: () =>
            import("./routes/app/customer").then(convert(queryClient)),
        },
        {
          path: paths.app.category.path,
          lazy: () =>
            import("./routes/app/category").then(convert(queryClient)),
        },
        {
          path: paths.app.unit.path,
          lazy: () => import("./routes/app/unit").then(convert(queryClient)),
        },
      ],
    },
    {
      path: "*",
      lazy: () => import("./routes/not-found").then(convert(queryClient)),
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();

  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
};
