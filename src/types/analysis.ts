export type AdvancedAnalysisInput = {
  sleepPosition?: "side" | "back" | "stomach";
  bedtimeConsistency?: "very_consistent" | "somewhat_consistent" | "irregular";
  fatigueLevel?: number;
  snoringConcern?: "yes" | "no" | "unsure";
  notes?: string;
};

export type AdvancedAnalysisResult = {
  neuralSummary: string;
  circadianTuning: string;
  pulseObservation: string;
  actionPlan: string[];
};
