import { useCallback, useEffect, useMemo, useState } from "react";
import { toAppError } from "../services/api/errors";
import { getSessions } from "../services/api/sessionService";
import type { AppError } from "../types/api";
import type { SessionRecord } from "../types/session";

type UseSessionHistoryOptions = {
  pageSize?: number;
};

export type UseSessionHistoryResult = {
  sessions: SessionRecord[];
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
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [deviceFilter, setDeviceFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetchPage = useCallback(
    async (nextSkip: number, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await getSessions({
          limit: pageSize,
          skip: nextSkip,
          device_id: deviceFilter.trim() || undefined,
        });

        setTotal(response.total);
        setSkip(nextSkip);
        setSessions((current) =>
          append ? [...current, ...response.sessions] : response.sessions,
        );
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
