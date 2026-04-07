export type ApiErrorPayload = {
  error?: string;
  detail?: string;
  code?: number;
  timestamp?: string;
};

export type AppError = {
  message: string;
  statusCode?: number;
  code?: string;
  timestamp?: string;
  isNotFound?: boolean;
};
