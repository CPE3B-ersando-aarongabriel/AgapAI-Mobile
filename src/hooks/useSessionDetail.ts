import { useCallback, useEffect, useState } from "react";
import { toAppError } from "../services/api/errors";
import {
  getSessionById,
  getSessionSummary,
} from "../services/api/sessionService";
import type { AppError } from "../types/api";
import type { SessionSummary } from "../types/session";

const summaryCache = new Map<string, SessionSummary>();

function mapLegacyToSummary(record: {
  session_id: string;
  device_id: string;
  started_at: string;
  updated_at: string;
  ended_at: string | null;
  sensor_events: unknown[];
  latest_pre_analysis: SessionSummary["latestPreAnalysis"];
  latest_device_response: SessionSummary["latestDeviceResponse"];
}): SessionSummary {
  const startedAt = new Date(record.started_at);
  const updatedAt = new Date(record.updated_at);
  const endedAt = record.ended_at ? new Date(record.ended_at) : null;

  return {
    sessionId: record.session_id,
    deviceId: record.device_id,
    status: record.ended_at ? "ended" : "active",
    startedAt: Number.isNaN(startedAt.getTime()) ? new Date() : startedAt,
    updatedAt: Number.isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
    endedAt: endedAt && !Number.isNaN(endedAt.getTime()) ? endedAt : null,
    sampleCount: record.sensor_events.length,
    deviceSummary: null,
    backendSummary: null,
    finalSummary: null,
    summaryMetrics: null,
    latestPreAnalysis: record.latest_pre_analysis,
    latestDeviceResponse: record.latest_device_response,
  };
}

export type UseSessionDetailResult = {
  session: SessionSummary | null;
  isLoading: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
};

export function useSessionDetail(
  sessionId: string | null | undefined,
): UseSessionDetailResult {
  const [session, setSession] = useState<SessionSummary | null>(null);
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
      const cached = summaryCache.get(sessionId);
      if (cached) {
        setSession(cached);
      }

      const response = await getSessionSummary(sessionId);
      summaryCache.set(sessionId, response);
      setSession(response);
    } catch {
      // Fallback for legacy backend shape support.
      try {
        const legacy = await getSessionById(sessionId);
        const mapped = mapLegacyToSummary(legacy);
        summaryCache.set(sessionId, mapped);
        setSession(mapped);
      } catch (fallbackErr) {
        setError(toAppError(fallbackErr));
        setSession(null);
      }
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
