import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboard } from "../services/api/dashboardService";
import { toAppError } from "../services/api/errors";
import {
  getSessionById,
  getDeviceSessions,
  requestInsightChat,
} from "../services/api/sessionService";
import { useAppStore } from "../store/appStore";
import type { AppError } from "../types/api";
import type { InsightMessage, InsightPromptSuggestion } from "../types/chat";

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
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

  const hydrateStoredInsightHistory = useCallback(async (sessionId: string) => {
    try {
      const fullSession = await getSessionById(sessionId);
      const history = fullSession.insight_history ?? [];

      const hydratedMessages: InsightMessage[] = history.flatMap((entry) => {
        const createdAt = entry.generated_at ?? new Date().toISOString();
        const userMessage: InsightMessage = {
          id: createId(),
          role: "user",
          content: entry.question,
          createdAt,
        };

        const assistantMessage: InsightMessage = {
          id: createId(),
          role: "assistant",
          content: entry.answer,
          createdAt,
          sourceSessionId: entry.context?.session_id ?? undefined,
          sections: [
            {
              title: "Context",
              items: [
                `Mode: ${entry.context?.mode ?? "unknown"}`,
                `Type: coaching insight`,
                `AI used: ${entry.ai_used ? "yes" : "no"}`,
                `Grounded: ${entry.grounded ? "yes" : "no"}`,
              ],
            },
          ],
        };

        return [userMessage, assistantMessage];
      });

      setMessages(hydratedMessages);
    } catch {
      // Not blocking: if full session lookup fails, continue with empty history.
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    const loadContext = async () => {
      setIsLoadingContext(true);
      setError(null);

      try {
        const dashboard = await getDashboard();
        const firstDeviceId = dashboard.latest_highlights[0]?.device_id ?? null;
        const latestSessionId = dashboard.latest_highlights[0]?.session_id ?? null;
        setSelectedDeviceId(firstDeviceId);

        const resolvedSessionId =
          selectedSessionFromStore ?? latestSessionId ?? null;

        if (selectedSessionFromStore) {
          setSelectedSessionId(selectedSessionFromStore);
          await hydrateStoredInsightHistory(selectedSessionFromStore);
        } else if (firstDeviceId) {
          const sessions = await getDeviceSessions(firstDeviceId, {
            limit: 1,
            skip: 0,
          });
          const firstSessionId = sessions.sessions[0]?.sessionId ?? resolvedSessionId;
          setSelectedSessionId(firstSessionId ?? null);

          if (firstSessionId) {
            await hydrateStoredInsightHistory(firstSessionId);
          } else {
            setMessages([]);
          }
        } else {
          setSelectedSessionId(resolvedSessionId);
          if (resolvedSessionId) {
            await hydrateStoredInsightHistory(resolvedSessionId);
          } else {
            setMessages([]);
          }
        }
      } catch (err) {
        setError(toAppError(err));
        setMessages([]);
      } finally {
        setIsLoadingContext(false);
      }
    };

    void loadContext();
  }, [hydrateStoredInsightHistory, selectedSessionFromStore]);

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

      setIsStreaming(true);

      try {
        const response = await requestInsightChat({
          question: trimmed,
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
                `Type: coaching insight`,
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
    setMessages([]);
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
