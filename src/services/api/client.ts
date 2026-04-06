import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // Reserved for future request metadata (trace id, app version, etc).
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Reserved for centralized API error handling.
    return Promise.reject(error);
  }
);
