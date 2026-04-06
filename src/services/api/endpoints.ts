export const apiEndpoints = {
  sessions: "/v1/sessions",
  sessionDetail: (sessionId: string) => `/v1/sessions/${sessionId}`,
  insightsChat: process.env.EXPO_PUBLIC_CHAT_ENDPOINT ?? "/v1/insights/chat",
  advancedAnalysis:
    process.env.EXPO_PUBLIC_ADVANCED_ANALYSIS_ENDPOINT ??
    "/v1/analysis/advanced",
} as const;
