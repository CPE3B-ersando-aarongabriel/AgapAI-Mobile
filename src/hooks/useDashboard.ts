import { useCallback, useEffect, useState } from "react";
import { getDashboard } from "../services/api/dashboardService";
import { toAppError } from "../services/api/errors";
import type { AppError } from "../types/api";
import type { DashboardResponse } from "../types/dashboard";

export type UseDashboardResult = {
  dashboard: DashboardResponse | null;
  isLoading: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
};

export function useDashboard(): UseDashboardResult {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDashboard();
      setDashboard(response);
    } catch (err) {
      setError(toAppError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    dashboard,
    isLoading,
    error,
    refresh,
  };
}
