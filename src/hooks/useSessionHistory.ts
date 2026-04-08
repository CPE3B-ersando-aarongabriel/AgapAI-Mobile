import { useCallback, useEffect, useMemo, useState } from "react";
import { toAppError } from "../services/api/errors";
import { getDashboard } from "../services/api/dashboardService";
import { getDeviceSessions } from "../services/api/sessionService";
import type { AppError } from "../types/api";
import type { SessionSummary } from "../types/session";

type CachedHistory = {
  total: number;
  sessions: SessionSummary[];
};

const historyCache = new Map<string, CachedHistory>();

type UseSessionHistoryOptions = {
  pageSize?: number;
  defaultDeviceId?: string;
};

export type UseSessionHistoryResult = {
  sessions: SessionSummary[];
  total: number;
  deviceFilter: string;
  setDeviceFilter: (value: string) => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: AppError | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

export function useSessionHistory(
  options: UseSessionHistoryOptions = {},
): UseSessionHistoryResult {
  const pageSize = options.pageSize ?? 10;
  const defaultDeviceId =
    options.defaultDeviceId?.trim() ?? process.env.EXPO_PUBLIC_DEFAULT_DEVICE_ID?.trim() ?? "";
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [deviceFilter, setDeviceFilter] = useState(defaultDeviceId);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetchPage = useCallback(
    async (nextSkip: number, append: boolean) => {
      const normalizedDeviceId = deviceFilter.trim();
      if (!normalizedDeviceId) {
        setIsLoading(false);
        setIsLoadingMore(false);
        setSessions([]);
        setTotal(0);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        if (!append && nextSkip === 0) {
          const cached = historyCache.get(normalizedDeviceId);
          if (cached) {
            setSessions(cached.sessions);
            setTotal(cached.total);
            setSkip(0);
          }
        }

        const response = await getDeviceSessions(normalizedDeviceId, {
          limit: pageSize,
          skip: nextSkip,
        });

        setTotal(response.total);
        setSkip(nextSkip);
        setSessions((current) => {
          const merged = append
            ? [...current, ...response.sessions]
            : response.sessions;
          historyCache.set(normalizedDeviceId, {
            total: response.total,
            sessions: merged,
          });
          return merged;
        });
      } catch (err) {
        setError(toAppError(err));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [deviceFilter, pageSize],
  );

  const refresh = useCallback(async () => {
    await fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || isLoading || sessions.length >= total) {
      return;
    }
    await fetchPage(skip + pageSize, true);
  }, [
    fetchPage,
    isLoading,
    isLoadingMore,
    pageSize,
    sessions.length,
    skip,
    total,
  ]);

  useEffect(() => {
    void fetchPage(0, false);
  }, [deviceFilter, fetchPage]);

  useEffect(() => {
    if (deviceFilter.trim()) {
      return;
    }

    let active = true;
    const detectDevice = async () => {
      try {
        const dashboard = await getDashboard();
        const suggestedDeviceId = dashboard.latest_highlights[0]?.device_id;
        if (active && suggestedDeviceId) {
          setDeviceFilter(suggestedDeviceId);
        }
      } catch {
        // Keep history empty until user provides a device id.
      }
    };

    void detectDevice();
    return () => {
      active = false;
    };
  }, [deviceFilter]);

  const hasMore = useMemo(
    () => sessions.length < total,
    [sessions.length, total],
  );

  return {
    sessions,
    total,
    deviceFilter,
    setDeviceFilter,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}
