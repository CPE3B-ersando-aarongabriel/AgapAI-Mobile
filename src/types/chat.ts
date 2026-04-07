export type InsightMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: string;
  sections?: {
    title: string;
    items: string[];
  }[];
  sourceSessionId?: string;
  isError?: boolean;
};

export type InsightPromptSuggestion = {
  id: string;
  label: string;
  prompt: string;
};
