import type { InsightMessage } from "../types/chat";

export type UseInsightsResult = {
  messages: InsightMessage[];
  isStreaming: boolean;
};

export function useInsights(): UseInsightsResult {
  return {
    messages: [],
    isStreaming: false,
  };
}
