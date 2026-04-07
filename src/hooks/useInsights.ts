import { useCallback, useEffect, useMemo, useState } from "react";
import { toAppError } from "../services/api/errors";
import {
  getSessionById,
  getSessions,
  requestAdvancedAnalysis,
} from "../services/api/sessionService";
import type { AppError } from "../types/api";
import type { InsightMessage, InsightPromptSuggestion } from "../types/chat";

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function inferFocusAreas(prompt: string): string[] {
  const normalized = prompt.toLowerCase();
  const areas: string[] = [];

  if (normalized.includes("breath")) {
    areas.push("breathing");
  }
  if (normalized.includes("snore")) {
    areas.push("snoring");
  }
  if (normalized.includes("posture") || normalized.includes("position")) {
    areas.push("sleep_posture");
  }
  if (
    normalized.includes("room") ||
    normalized.includes("temp") ||
    normalized.includes("humidity")
  ) {
    areas.push("room_comfort");
  }
  if (normalized.includes("fatigue") || normalized.includes("tired")) {
    areas.push("fatigue");
  }
  if (normalized.includes("bedtime") || normalized.includes("routine")) {
    areas.push("bedtime_consistency");
  }

  return areas.length ? areas : ["breathing", "bedtime_consistency"];
}

const defaultSuggestions: InsightPromptSuggestion[] = [
  {
    id: "analyze-last-night",
    label: "Analyze last night",
    prompt: "Analyze my last night and tell me one key improvement.",
  },
  {
    id: "reduce-snoring",
    label: "Reduce snoring",
    prompt: "What is one practical step to reduce snoring tonight?",
  },
  {
    id: "deep-sleep",
    label: "Deep sleep tips",
    prompt: "Give me tips to improve deep sleep consistency this week.",
  },
];

export type UseInsightsResult = {
  messages: InsightMessage[];
  isStreaming: boolean;
  isLoadingContext: boolean;
  error: AppError | null;
  selectedSessionId: string | null;
  suggestions: InsightPromptSuggestion[];
  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
};

export function useInsights(): UseInsightsResult {
  const [messages, setMessages] = useState<InsightMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    setMessages([
      {
        id: createId(),
        role: "assistant",
        content:
          "I am ready to help using your recent session data. Ask me about breathing, snoring, room comfort, or bedtime rhythm.",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    const loadContext = async () => {
      setIsLoadingContext(true);
      setError(null);

      try {
        const response = await getSessions({ limit: 1, skip: 0 });
        setSelectedSessionId(response.sessions[0]?.session_id ?? null);
      } catch (err) {
        setError(toAppError(err));
      } finally {
        setIsLoadingContext(false);
      }
    };

    void loadContext();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) {
        return;
      }

      const userMessage: InsightMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, userMessage]);
      setError(null);

      if (!selectedSessionId) {
        setMessages((current) => [
          ...current,
          {
            id: createId(),
            role: "assistant",
            content:
              "No session is available yet. Record at least one session from your device to unlock personalized insights.",
            createdAt: new Date().toISOString(),
            isError: true,
          },
        ]);
        return;
      }

      setIsStreaming(true);

      try {
        const focusAreas = inferFocusAreas(trimmed);

        const [detail, advanced] = await Promise.all([
          getSessionById(selectedSessionId),
          requestAdvancedAnalysis(selectedSessionId, {
            focus_areas: focusAreas,
            include_environmental_context: true,
            include_behavioral_suggestions: true,
          }),
        ]);

        const preSummary = detail.latest_pre_analysis?.summary;

        const assistantMessage: InsightMessage = {
          id: createId(),
          role: "assistant",
          content:
            preSummary ||
            "Here is guidance based on your selected session and advanced analysis request.",
          createdAt: new Date().toISOString(),
          sourceSessionId: selectedSessionId,
          sections: [
            {
              title: "Deep Insights",
              items: advanced.detailed_insights,
            },
            {
              title: "Recommended Actions",
              items: advanced.recommendations,
            },
            {
              title: "Confidence",
              items: [advanced.confidence_note],
            },
          ],
        };

        setMessages((current) => [...current, assistantMessage]);
      } catch (err) {
        const appError = toAppError(err);
        setError(appError);
        setMessages((current) => [
          ...current,
          {
            id: createId(),
            role: "assistant",
            content: appError.message,
            createdAt: new Date().toISOString(),
            isError: true,
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, selectedSessionId],
  );

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: createId(),
        role: "assistant",
        content:
          "Chat cleared. Ask for a fresh analysis whenever you are ready.",
        createdAt: new Date().toISOString(),
      },
    ]);
    setError(null);
  }, []);

  const suggestions = useMemo(() => defaultSuggestions, []);

  return {
    messages,
    isStreaming,
    isLoadingContext,
    error,
    selectedSessionId,
    suggestions,
    sendMessage,
    resetChat,
  };
}
