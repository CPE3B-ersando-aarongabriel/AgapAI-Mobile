import type { DashboardResponse } from "../../types/dashboard";
import { cleanBackendText } from "./errors";
import { apiClient } from "./client";
import { apiEndpoints } from "./endpoints";

function sanitizeDashboard(data: DashboardResponse): DashboardResponse {
  return {
    ...data,
    latest_highlights: data.latest_highlights.map((item) => ({
      ...item,
      summary: cleanBackendText(item.summary),
    })),
  };
}

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>(apiEndpoints.dashboard);
  return sanitizeDashboard(data);
}
