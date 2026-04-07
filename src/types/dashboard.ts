export type DashboardHighlight = {
  session_id: string;
  device_id: string;
  updated_at: string;
  summary: string;
};

export type DashboardTrend = {
  date: string;
  avg_breathing_rate: number;
  avg_snore_level: number;
};

export type DashboardResponse = {
  total_sessions: number;
  average_breathing_rate: number;
  average_snore_level: number;
  latest_highlights: DashboardHighlight[];
  trends: DashboardTrend[];
};
