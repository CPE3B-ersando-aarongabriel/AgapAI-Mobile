import type { DashboardResponse } from "../../types/dashboard";
import { apiClient } from "./client";
import { apiEndpoints } from "./endpoints";
import { cleanBackendText } from "./errors";
import { withGetRetry } from "./retry";

function sanitizeDashboard(data: DashboardResponse): DashboardResponse {
  return {
    ...data,
    trends: [...data.trends].sort((a, b) => a.date.localeCompare(b.date)),
    latest_highlights: data.latest_highlights.map((item) => ({
      ...item,
      summary: cleanBackendText(item.summary),
    })),
  };
}

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await withGetRetry(() =>
    apiClient.get<DashboardResponse>(apiEndpoints.dashboard),
  );
  const { data } = response;
  return sanitizeDashboard(data);
}
