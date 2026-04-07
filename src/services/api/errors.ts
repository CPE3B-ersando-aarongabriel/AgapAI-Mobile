import { isAxiosError } from "axios";
import type { ApiErrorPayload, AppError } from "../../types/api";

function cleanText(input: string): string {
  return input.replace(/Â/g, "").trim();
}

function getFallbackMessage(statusCode?: number): string {
  if (statusCode === 404) {
    return "The requested record was not found. It may have been removed or not generated yet.";
  }
  if (statusCode && statusCode >= 500) {
    return "AgapAI backend is temporarily unavailable. Please try again in a moment.";
  }
  return "Something went wrong while contacting AgapAI backend.";
}

export function toAppError(error: unknown): AppError {
  if (!isAxiosError(error)) {
    return { message: "Unexpected app error occurred." };
  }

  if (!error.response) {
    return {
      message:
        "Network error. The app could not reach the backend service. Check internet connection and API host.",
      code: error.code,
    };
  }

  const statusCode = error.response?.status;
  const payload = (error.response?.data ?? {}) as ApiErrorPayload;
  const detail = typeof payload.detail === "string" ? cleanText(payload.detail) : "";
  const code = typeof payload.error === "string" ? payload.error : undefined;
  const timestamp = typeof payload.timestamp === "string" ? payload.timestamp : undefined;
  const isNotFound = statusCode === 404 || payload.code === 404;

  let message = detail || getFallbackMessage(statusCode);

  if (isNotFound && code === "application_error") {
    message = detail || "No matching data was found yet for this session.";
  }

  return {
    message,
    statusCode,
    code,
    timestamp,
    isNotFound,
  };
}

export function cleanBackendText(input: string | null | undefined): string {
  return typeof input === "string" ? cleanText(input) : "";
}
