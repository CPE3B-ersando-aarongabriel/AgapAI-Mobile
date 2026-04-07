import { useCallback, useEffect, useState } from "react";
import { toAppError } from "../services/api/errors";
import { getSessionById } from "../services/api/sessionService";
import type { AppError } from "../types/api";
import type { SessionRecord } from "../types/session";

export type UseSessionDetailResult = {
  session: SessionRecord | null;
  isLoading: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
};

export function useSessionDetail(
  sessionId: string | null | undefined,
): UseSessionDetailResult {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    if (!sessionId) {
      setSession(null);
      setError({ message: "No session selected." });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getSessionById(sessionId);
      setSession(response);
    } catch (err) {
      setError(toAppError(err));
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    session,
    isLoading,
    error,
    refresh,
  };
}
