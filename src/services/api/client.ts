import axios from "axios";

const fallbackBaseURL = "https://agapai-backend.onrender.com";
const envBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

// Prevent accidental localhost config from breaking device builds.
const baseURL =
  envBaseURL &&
  !envBaseURL.includes("localhost") &&
  !envBaseURL.includes("127.0.0.1")
    ? envBaseURL
    : fallbackBaseURL;

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (__DEV__) {
    const method = (config.method ?? "get").toUpperCase();
    const requestBase = config.baseURL ?? baseURL;
    const requestPath = config.url ?? "";
    console.log(`[API] ${method} ${requestBase}${requestPath}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      const method = (error.config?.method ?? "get").toUpperCase();
      const requestBase = error.config?.baseURL ?? baseURL;
      const requestPath = error.config?.url ?? "";
      const status = error.response?.status ?? "no-response";
      console.log(
        `[API][ERROR] ${method} ${requestBase}${requestPath} status=${status} message=${error.message}`,
      );
    }

    return Promise.reject(error);
  },
);
