export type InsightMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: string;
};
