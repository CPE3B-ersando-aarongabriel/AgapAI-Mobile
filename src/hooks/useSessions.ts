import type { SessionSummary } from "../types/session";

export type UseSessionsResult = {
  sessions: SessionSummary[];
  isLoading: boolean;
  error: string | null;
};

export function useSessions(): UseSessionsResult {
  return {
    sessions: [],
    isLoading: false,
    error: null,
  };
}
