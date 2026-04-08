import { useCallback, useEffect, useState } from "react";
import { toAppError } from "../services/api/errors";
import { getDeviceSessions, getSessions } from "../services/api/sessionService";
import type { AppError } from "../types/api";
import type { SessionRecord, SessionSummary } from "../types/session";

export type UseSessionsOptions = {
  limit?: number;
  deviceId?: string;
};

export type UseSessionsResult = {
  sessions: (SessionRecord | SessionSummary)[];
  total: number;
  isLoading: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
};

export function useSessions(
  options: UseSessionsOptions = {},
): UseSessionsResult {
  const [sessions, setSessions] = useState<(SessionRecord | SessionSummary)[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const trimmedDeviceId = options.deviceId?.trim() || undefined;

      if (trimmedDeviceId) {
        const response = await getDeviceSessions(trimmedDeviceId, {
          limit: options.limit ?? 20,
          skip: 0,
        });
        setSessions(response.sessions);
        setTotal(response.total);
      } else {
        const response = await getSessions({
          limit: options.limit ?? 20,
          skip: 0,
        });

        setSessions(response.sessions);
        setTotal(response.total);
      }
    } catch (err) {
      setError(toAppError(err));
    } finally {
      setIsLoading(false);
    }
  }, [options.deviceId, options.limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    sessions,
    total,
    isLoading,
    error,
    refresh,
  };
}
