export const apiEndpoints = {
  root: "/",
  health: "/health",
  dashboard: "/api/dashboard",
  deviceSessions: (deviceId: string) =>
    `/api/device/${encodeURIComponent(deviceId)}/sessions`,
  sessions: "/api/sessions",
  sessionStart: "/api/session/start",
  sessionChunk: "/api/session/chunk",
  sessionEnd: "/api/session/end",
  sessionById: (sessionId: string) =>
    `/api/session/${encodeURIComponent(sessionId)}`,
  sessionLive: (sessionId: string) =>
    `/api/session/${encodeURIComponent(sessionId)}/live`,
  sessionSummary: (sessionId: string) =>
    `/api/session/${encodeURIComponent(sessionId)}/summary`,
  sessionSamples: (sessionId: string) =>
    `/api/session/${encodeURIComponent(sessionId)}/samples`,
  sessionAdvanced: (sessionId: string) =>
    `/api/session/${encodeURIComponent(sessionId)}/advanced`,
  insightChat: "/api/insight/chat",
} as const;
