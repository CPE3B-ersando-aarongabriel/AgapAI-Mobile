export type FocusAreaOption =
  | "breathing"
  | "snoring"
  | "sleep_posture"
  | "room_comfort"
  | "fatigue"
  | "bedtime_consistency"
  | "other";

export type AdvancedAnalysisInputValues = {
  focusAreas: FocusAreaOption[];
  breathingConcern: boolean;
  snoringConcern: boolean;
  sleepPosture: "side" | "back" | "stomach" | "unsure";
  roomComfort: "comfortable" | "too_warm" | "too_cold" | "humid" | "dry";
  fatigueLevel: "full_energy" | "moderate" | "fatigued";
  notes: string;
};

export type AdvancedAnalysisRequestPayload = {
  focus_areas: string[];
  include_environmental_context: boolean;
  include_behavioral_suggestions: boolean;
};

export type AdvancedAnalysisResponse = {
  session_id: string;
  detailed_insights: string[];
  recommendations: string[];
  confidence_note: string;
  generated_at: string;
  ai_used: boolean;
};
