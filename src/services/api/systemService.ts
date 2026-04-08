import type { HealthResponse, RootServiceInfo } from "../../types/system";
import { apiClient } from "./client";
import { apiEndpoints } from "./endpoints";
import { withGetRetry } from "./retry";

export async function getRootServiceInfo(): Promise<RootServiceInfo> {
  const response = await withGetRetry(() =>
    apiClient.get<RootServiceInfo>(apiEndpoints.root),
  );
  const { data } = response;
  return data;
}

export async function getHealthStatus(): Promise<HealthResponse> {
  const response = await withGetRetry(() =>
    apiClient.get<HealthResponse>(apiEndpoints.health),
  );
  const { data } = response;
  return data;
}
