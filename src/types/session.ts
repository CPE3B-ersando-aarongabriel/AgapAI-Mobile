export type RiskLevel = "low" | "medium" | "high" | string;

export type SessionStatus = "active" | "completed" | string;

export type SessionStartRequest = {
  device_id: string;
  firmware_version?: string;
  metadata?: Record<string, unknown>;
};

export type SessionStartResponse = {
  session_id: string;
  device_id: string;
  status: SessionStatus;
  started_at: string;
};

export type SessionDataRequest = {
  session_id: string;
  breathing_rate: number;
  snore_level: number;
  temperature: number;
  humidity: number;
  movement_level?: number;
  presence_detected?: boolean;
  recorded_at?: string;
};

export type BreathingPattern = {
  label: string;
  inhale_seconds: number;
  hold_seconds: number;
  exhale_seconds: number;
  cycles: number;
};

export type PreAnalysis = {
  risk_level: RiskLevel;
  flags: string[];
  summary: string;
};

export type SessionDataResponse = {
  session_id: string;
  recommendations: string[];
  breathing_pattern: BreathingPattern;
  pre_analysis: PreAnalysis;
  ai_used: boolean;
};

export type SensorEvent = {
  event_id: string;
  session_id: string;
  breathing_rate: number;
  snore_level: number;
  temperature: number;
  humidity: number;
  movement_level?: number;
  presence_detected?: boolean;
  recorded_at: string;
};

export type AdvancedAnalysisRecord = {
  session_id: string;
  detailed_insights: string[];
  recommendations: string[];
  confidence_note: string;
  generated_at: string;
  ai_used: boolean;
};

export type DeviceResponse = {
  session_id: string;
  recommendations: string[];
  breathing_pattern: BreathingPattern;
  pre_analysis: PreAnalysis;
  ai_used: boolean;
};

export type SessionRecord = {
  session_id: string;
  device_id: string;
  started_at: string;
  updated_at: string;
  ended_at: string | null;
  sensor_events: SensorEvent[];
  latest_pre_analysis: PreAnalysis | null;
  latest_device_response: DeviceResponse | null;
  advanced_analysis: AdvancedAnalysisRecord | null;
};

export type SessionsResponse = {
  sessions: SessionRecord[];
  total: number;
};
