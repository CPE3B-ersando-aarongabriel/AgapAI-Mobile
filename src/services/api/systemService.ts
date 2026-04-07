import type { HealthResponse, RootServiceInfo } from "../../types/system";
import { apiClient } from "./client";
import { apiEndpoints } from "./endpoints";

export async function getRootServiceInfo(): Promise<RootServiceInfo> {
  const { data } = await apiClient.get<RootServiceInfo>(apiEndpoints.root);
  return data;
}

export async function getHealthStatus(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>(apiEndpoints.health);
  return data;
}
