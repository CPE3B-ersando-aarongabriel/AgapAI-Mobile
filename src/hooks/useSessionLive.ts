import { useCallback, useEffect, useState } from "react";
import { toAppError } from "../services/api/errors";
import { getSessionLiveStatus } from "../services/api/sessionService";
import type { AppError } from "../types/api";
import type { SessionLiveStatus } from "../types/session";

type UseSessionLiveOptions = {
  enabled?: boolean;
  pollIntervalMs?: number;
};

export type UseSessionLiveResult = {
  live: SessionLiveStatus | null;
  isLoading: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
};

const liveCache = new Map<string, SessionLiveStatus>();

export function useSessionLive(
  sessionId: string | null | undefined,
  options: UseSessionLiveOptions = {},
): UseSessionLiveResult {
  const enabled = options.enabled ?? true;
  const pollIntervalMs = options.pollIntervalMs ?? 5000;
  const [live, setLive] = useState<SessionLiveStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    if (!sessionId || !enabled) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    setError(null);
    setIsLoading(true);

    try {
      const cached = liveCache.get(sessionId);
      if (cached) {
        setLive(cached);
      }

      const response = await getSessionLiveStatus(sessionId, {
        signal: controller.signal,
      });
      liveCache.set(sessionId, response);
      setLive(response);
    } catch (err) {
      setError(toAppError(err));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, sessionId]);

  useEffect(() => {
    if (!sessionId || !enabled) {
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    const run = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const response = await getSessionLiveStatus(sessionId, {
          signal: controller.signal,
        });
        if (!mounted) {
          return;
        }
        liveCache.set(sessionId, response);
        setLive(response);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(toAppError(err));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    const interval = setInterval(() => {
      void run();
    }, pollIntervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
      controller.abort();
    };
  }, [enabled, pollIntervalMs, sessionId]);

  return {
    live,
    isLoading,
    error,
    refresh,
  };
}
