import axios, { type InternalAxiosRequestConfig } from "axios";
import { apiEndpoints } from "./endpoints";

const fallbackBaseURL = "https://agapai-backend-production.up.railway.app";
const envBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const healthCheckTtlMs = 15000;
const healthCheckTimeoutMs = 5000;

// Prevent accidental localhost config from breaking device builds.
const baseURL =
  envBaseURL &&
  !envBaseURL.includes("localhost") &&
  !envBaseURL.includes("127.0.0.1")
    ? envBaseURL
    : fallbackBaseURL;

let lastHealthCheckAt = 0;
let lastHealthCheckOk = false;
let lastHealthCheckError: unknown = null;
let inFlightHealthCheck: Promise<void> | null = null;

function shouldSkipHealthPreflight(
  config: InternalAxiosRequestConfig,
): boolean {
  const requestPath = config.url ?? "";

  if (!requestPath) {
    return true;
  }

  if (
    requestPath === apiEndpoints.health ||
    requestPath.startsWith("/health?")
  ) {
    return true;
  }

  return !requestPath.startsWith("/api/");
}

function isRecentHealthResult(): boolean {
  return Date.now() - lastHealthCheckAt < healthCheckTtlMs;
}

async function runHealthCheck(): Promise<void> {
  if (inFlightHealthCheck) {
    return inFlightHealthCheck;
  }

  inFlightHealthCheck = axios
    .get(`${baseURL}${apiEndpoints.health}`, {
      timeout: healthCheckTimeoutMs,
    })
    .then(() => {
      lastHealthCheckOk = true;
      lastHealthCheckError = null;
      lastHealthCheckAt = Date.now();
    })
    .catch((error) => {
      lastHealthCheckOk = false;
      lastHealthCheckError = error;
      lastHealthCheckAt = Date.now();
      throw error;
    })
    .finally(() => {
      inFlightHealthCheck = null;
    });

  return inFlightHealthCheck;
}

async function ensureBackendAvailable(
  config: InternalAxiosRequestConfig,
): Promise<void> {
  if (shouldSkipHealthPreflight(config)) {
    return;
  }

  if (isRecentHealthResult()) {
    if (lastHealthCheckOk) {
      return;
    }

    throw lastHealthCheckError ?? new Error("Backend health check failed.");
  }

  await runHealthCheck();
}

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  await ensureBackendAvailable(config);

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
