export type SessionSummary = {
  id: string;
  date: string;
  score: number;
  title: string;
};

export type SessionDetail = {
  id: string;
  breathingRateRpm: number;
  snoreLevel: "low" | "medium" | "high";
  roomTemperatureF: number;
  humidityPercent: number;
  recommendations: string[];
};
