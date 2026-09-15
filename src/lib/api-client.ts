import Axios, { type InternalAxiosRequestConfig } from "axios";

import { paths } from "@/config/paths";
import { useNotifications } from "@/components/ui/notifications";
import { env } from "@/config/env";

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = "application/json";
  }
  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL + "/api/",
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (respone) => {
    return respone.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    useNotifications.getState().addNotification({
      type: "error",
      title: "Error",
      message,
    });

    if (error.response?.status === 401) {
      const searchParams = new URLSearchParams();
      const redirectTo =
        searchParams.get("redirectTo") || window.location.pathname;
      const loginHref = paths.auth.login.getHref(redirectTo);
      // Guard: tránh redirect loop nếu đang ở trang login rồi
      if (!window.location.pathname.startsWith("/auth/login")) {
        window.location.href = loginHref;
      }
    }

    return Promise.reject(error);
  },
);
