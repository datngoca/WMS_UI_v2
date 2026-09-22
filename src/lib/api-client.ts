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

const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    // Tránh lỗi Mixed Content khi web chạy trên HTTPS: dùng proxy Vite /api/
    return "/api/";
  }
  let url = env.API_URL;
  if (
    typeof window !== "undefined" &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    url = url.replace(/localhost|127\.0\.0\.1/, window.location.hostname);
  }
  return url.endsWith("/") ? `${url}api/` : `${url}/api/`;
};

export const api = Axios.create({
  baseURL: getBaseUrl(),
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
