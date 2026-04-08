export type ApiErrorPayload = {
  error?: string;
  detail?: string;
  code?: number;
  timestamp?: string;
  // FastAPI validation errors often return detail as an array.
  validation_detail?: {
    loc?: (string | number)[];
    msg?: string;
    type?: string;
  }[];
  detail_items?: {
    loc?: (string | number)[];
    msg?: string;
    type?: string;
  }[];
  // Fallback for native FastAPI structure: { detail: [{...}] }
  detail_array?: {
    loc?: (string | number)[];
    msg?: string;
    type?: string;
  }[];
};

export type AppError = {
  message: string;
  statusCode?: number;
  code?: string;
  timestamp?: string;
  isNotFound?: boolean;
  validationIssues?: string[];
};
