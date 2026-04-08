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

export type InsightChatRequest = {
  question: string;
  session_id: string | null;
  device_id: string | null;
  store_conversation: boolean;
};

export type InsightChatResponse = {
  question: string;
  answer: string;
  context: {
    mode: "generic" | "device" | "session" | string;
    device_id: string | null;
    session_id: string | null;
    latest_session_id: string | null;
    sessions_considered: number;
    has_pre_analysis: boolean;
    has_advanced_analysis: boolean;
    has_dashboard_context: boolean;
  };
  ai_used: boolean;
  grounded: boolean;
  generated_at: string;
};
