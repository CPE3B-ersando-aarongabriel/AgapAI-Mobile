import { useCallback, useState } from "react";
import { toAppError } from "../services/api/errors";
import { requestAdvancedAnalysis } from "../services/api/sessionService";
import type { AdvancedAnalysisRequestPayload } from "../types/analysis";
import type { AppError } from "../types/api";
import type { AdvancedAnalysisRecord } from "../types/session";

export type UseAdvancedAnalysisResult = {
  isSubmitting: boolean;
  error: AppError | null;
  submit: (
    sessionId: string,
    payload: AdvancedAnalysisRequestPayload,
  ) => Promise<AdvancedAnalysisRecord | null>;
};

export function useAdvancedAnalysis(): UseAdvancedAnalysisResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const submit = useCallback(
    async (sessionId: string, payload: AdvancedAnalysisRequestPayload) => {
      setIsSubmitting(true);
      setError(null);

      try {
        return await requestAdvancedAnalysis(sessionId, payload);
      } catch (err) {
        setError(toAppError(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return {
    isSubmitting,
    error,
    submit,
  };
}
