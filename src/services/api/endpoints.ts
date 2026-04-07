export const apiEndpoints = {
  root: "/",
  health: "/health",
  dashboard: "/api/dashboard",
  sessions: "/api/sessions",
  sessionStart: "/api/session/start",
  sessionData: "/api/session/data",
  sessionById: (sessionId: string) =>
    `/api/session/${encodeURIComponent(sessionId)}`,
  sessionAdvanced: (sessionId: string) =>
    `/api/session/${encodeURIComponent(sessionId)}/advanced`,
} as const;
