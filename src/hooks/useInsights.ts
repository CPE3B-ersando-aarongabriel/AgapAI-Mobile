import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboard } from "../services/api/dashboardService";
import { toAppError } from "../services/api/errors";
import {
  getDeviceSessions,
  requestInsightChat,
} from "../services/api/sessionService";
import { useAppStore } from "../store/appStore";
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
  selectedDeviceId: string | null;
  suggestions: InsightPromptSuggestion[];
  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
};

export function useInsights(): UseInsightsResult {
  const { selectedSessionId: selectedSessionFromStore } = useAppStore();
  const [messages, setMessages] = useState<InsightMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
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
        const dashboard = await getDashboard();
        const firstDeviceId = dashboard.latest_highlights[0]?.device_id ?? null;
        setSelectedDeviceId(firstDeviceId);

        if (selectedSessionFromStore) {
          setSelectedSessionId(selectedSessionFromStore);
        } else if (firstDeviceId) {
          const sessions = await getDeviceSessions(firstDeviceId, {
            limit: 1,
            skip: 0,
          });
          setSelectedSessionId(sessions.sessions[0]?.sessionId ?? null);
        } else {
          setSelectedSessionId(null);
        }
      } catch (err) {
        setError(toAppError(err));
      } finally {
        setIsLoadingContext(false);
      }
    };

    void loadContext();
  }, [selectedSessionFromStore]);

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

      if (!selectedSessionId && !selectedDeviceId) {
        setMessages((current) => [
          ...current,
          {
            id: createId(),
            role: "assistant",
            content:
              "No session context is available yet. Record at least one session from your device to unlock personalized insights.",
            createdAt: new Date().toISOString(),
            isError: true,
          },
        ]);
        return;
      }

      setIsStreaming(true);

      try {
        const focusAreas = inferFocusAreas(trimmed);
        const response = await requestInsightChat({
          question: `${trimmed}${focusAreas.length ? `\n\nFocus areas: ${focusAreas.join(", ")}` : ""}`,
          session_id: selectedSessionId,
          device_id: selectedDeviceId,
          store_conversation: true,
        });

        const assistantMessage: InsightMessage = {
          id: createId(),
          role: "assistant",
          content: response.answer,
          createdAt: new Date().toISOString(),
          sourceSessionId:
            response.context.session_id ?? selectedSessionId ?? undefined,
          sections: [
            {
              title: "Context",
              items: [
                `Mode: ${response.context.mode ?? "unknown"}`,
                `AI used: ${response.ai_used ? "yes" : "no"}`,
                `Grounded: ${response.grounded ? "yes" : "no"}`,
              ],
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
    [isStreaming, selectedDeviceId, selectedSessionId],
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
    selectedDeviceId,
    suggestions,
    sendMessage,
    resetChat,
  };
}
