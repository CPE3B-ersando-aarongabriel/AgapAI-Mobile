import { useCallback, useEffect, useMemo, useState } from "react";
import { toAppError } from "../services/api/errors";
import { getSessionSamples } from "../services/api/sessionService";
import type { AppError } from "../types/api";
import type { SessionSample } from "../types/session";

type UseSessionSamplesOptions = {
  pageSize?: number;
};

export type UseSessionSamplesResult = {
  samples: SessionSample[];
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

type CachedSamples = {
  total: number;
  samples: SessionSample[];
};

const samplesCache = new Map<string, CachedSamples>();

export function useSessionSamples(
  sessionId: string | null | undefined,
  options: UseSessionSamplesOptions = {},
): UseSessionSamplesResult {
  const pageSize = Math.min(2000, Math.max(1, options.pageSize ?? 200));
  const [samples, setSamples] = useState<SessionSample[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetchPage = useCallback(
    async (nextSkip: number, append: boolean) => {
      if (!sessionId) {
        setSamples([]);
        setTotal(0);
        setSkip(0);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const controller = new AbortController();

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        if (!append && nextSkip === 0) {
          const cached = samplesCache.get(sessionId);
          if (cached) {
            setSamples(cached.samples);
            setTotal(cached.total);
          }
        }

        const response = await getSessionSamples(
          sessionId,
          {
            limit: pageSize,
            skip: nextSkip,
          },
          {
            signal: controller.signal,
          },
        );

        setSkip(nextSkip);
        setTotal(response.total);
        setSamples((current) => {
          const merged = append
            ? [...current, ...response.samples]
            : response.samples;

          samplesCache.set(sessionId, {
            total: response.total,
            samples: merged,
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
    [pageSize, sessionId],
  );

  const refresh = useCallback(async () => {
    await fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!sessionId || isLoading || isLoadingMore || samples.length >= total) {
      return;
    }

    await fetchPage(skip + pageSize, true);
  }, [
    fetchPage,
    isLoading,
    isLoadingMore,
    pageSize,
    samples.length,
    sessionId,
    skip,
    total,
  ]);

  useEffect(() => {
    void fetchPage(0, false);
  }, [fetchPage]);

  const hasMore = useMemo(
    () => samples.length < total,
    [samples.length, total],
  );

  return {
    samples,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  };
}
