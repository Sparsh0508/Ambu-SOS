import axios from "axios";

export function resolveApiBaseUrl() {
  const envBaseUrl =
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL ??
    (import.meta.env.DEV
      ? import.meta.env.VITE_API_URL_LOCAL ?? "http://localhost:3000"
      : import.meta.env.VITE_API_URL_PROD ?? "http://localhost:3000");

  return String(envBaseUrl).replace(/\/+$/, "");
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let unauthorizedHandler = null;

export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? "");
    const isAuthProbe = requestUrl === "/auth" || requestUrl.endsWith("/auth");

    if (error.response?.status === 401 && !isAuthProbe) {
      unauthorizedHandler?.(error);
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  const serverMessage = error?.response?.data?.message;

  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
