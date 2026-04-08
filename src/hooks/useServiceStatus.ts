import { useCallback, useEffect, useState } from "react";
import { toAppError } from "../services/api/errors";
import {
  getHealthStatus,
  getRootServiceInfo,
} from "../services/api/systemService";
import type { AppError } from "../types/api";
import type { HealthResponse, RootServiceInfo } from "../types/system";

export type UseServiceStatusResult = {
  rootInfo: RootServiceInfo | null;
  health: HealthResponse | null;
  isLoading: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
};

export function useServiceStatus(): UseServiceStatusResult {
  const [rootInfo, setRootInfo] = useState<RootServiceInfo | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [rootResult, healthResult] = await Promise.allSettled([
        getRootServiceInfo(),
        getHealthStatus(),
      ]);

      if (rootResult.status === "fulfilled") {
        setRootInfo(rootResult.value);
      }

      if (healthResult.status === "fulfilled") {
        setHealth(healthResult.value);
      }

      if (
        rootResult.status === "rejected" &&
        healthResult.status === "rejected"
      ) {
        setError(toAppError(rootResult.reason));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    rootInfo,
    health,
    isLoading,
    error,
    refresh,
  };
}
