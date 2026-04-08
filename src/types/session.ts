export type RiskLevel = "low" | "medium" | "high" | string;

export type SessionStatus =
  | "started"
  | "active"
  | "ended"
  | "completed"
  | string;

export type SessionStartRequest = {
  device_id: string;
  firmware_version?: string;
  metadata?: Record<string, unknown>;
};

export type SessionStartResponse = {
  session_id: string;
  device_id: string;
  status: "started" | SessionStatus;
  started_at: string;
};

export type SessionChunkSample = {
  recorded_at: string;
  mic_raw: number;
  mic_rms: number;
  mic_peak: number;
  temperature: number;
  humidity: number;
  breathing_rate: number;
  movement_level: number;
  presence_detected: boolean;
};

export type SessionChunkRequest = {
  session_id: string;
  chunk_id?: string | null;
  samples: SessionChunkSample[];
};

export type SessionChunkResponse = {
  session_id: string;
  status: "chunk_received" | SessionStatus;
  received_count: number;
  total_samples: number;
  last_recorded_at: string | null;
};

export type SessionEndSummaryPayload = {
  sample_count: number;
  average_amplitude: number;
  rms_amplitude: number;
  peak_intensity: number;
  snore_event_count: number;
  snore_score: number;
  average_breathing_rate: number;
  average_temperature: number;
  average_humidity: number;
};

export type SessionEndRequest = {
  session_id: string;
  ended_at?: string;
  summary?: SessionEndSummaryPayload;
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

export type SessionSummaryMetrics = {
  snore_score?: number;
  average_breathing_rate?: number;
  average_snore_level?: number;
  average_temperature?: number;
  average_humidity?: number;
  average_amplitude?: number;
  rms_amplitude?: number;
  peak_intensity?: number;
  snore_event_count?: number;
  sample_count?: number;
  [key: string]: unknown;
};

export type SessionEndResponse = {
  session_id: string;
  status: "ended" | SessionStatus;
  ended_at: string;
  final_summary: SessionSummaryMetrics;
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

export type InsightHistoryEntry = {
  question: string;
  answer: string;
  context?: {
    mode?: string;
    device_id?: string | null;
    session_id?: string | null;
    latest_session_id?: string | null;
    sessions_considered?: number;
    has_pre_analysis?: boolean;
    has_advanced_analysis?: boolean;
    has_dashboard_context?: boolean;
  };
  ai_used?: boolean;
  grounded?: boolean;
  generated_at?: string;
};

export type DeviceResponse = {
  session_id: string;
  recommendations: string[];
  breathing_pattern: BreathingPattern;
  pre_analysis: PreAnalysis;
  ai_used: boolean;
  final_summary?: SessionSummaryMetrics | null;
};

export type SessionSummaryResponse = {
  session_id: string;
  device_id: string;
  status: SessionStatus;
  started_at: string;
  updated_at: string;
  ended_at: string | null;
  sample_count: number;
  device_summary: SessionSummaryMetrics | null;
  backend_summary: SessionSummaryMetrics | null;
  final_summary: SessionSummaryMetrics | null;
  latest_pre_analysis: PreAnalysis | null;
  latest_device_response: DeviceResponse | null;
};

export type DeviceSessionsResponse = {
  device_id: string;
  total: number;
  sessions: SessionSummaryResponse[];
};

export type SessionLiveStatusResponse = {
  session_id: string;
  device_id: string;
  status: SessionStatus;
  started_at: string;
  updated_at: string;
  last_sample_at: string | null;
  sample_count: number;
  average_amplitude: number;
  rms_amplitude: number;
  peak_intensity: number;
  snore_event_count: number;
  average_breathing_rate: number;
  average_temperature: number;
  average_humidity: number;
};

export type SessionSampleResponse = {
  recorded_at: string;
  mic_raw: number;
  mic_rms: number;
  mic_peak: number;
  temperature: number;
  humidity: number;
  breathing_rate: number;
  movement_level: number;
  presence_detected: boolean;
  received_at: string;
  chunk_id: string | null;
};

export type SessionSamplesPageResponse = {
  session_id: string;
  total: number;
  samples: SessionSampleResponse[];
};

export type SessionSummary = {
  sessionId: string;
  deviceId: string;
  status: SessionStatus;
  startedAt: Date;
  updatedAt: Date;
  endedAt: Date | null;
  sampleCount: number;
  deviceSummary: SessionSummaryMetrics | null;
  backendSummary: SessionSummaryMetrics | null;
  finalSummary: SessionSummaryMetrics | null;
  summaryMetrics: SessionSummaryMetrics | null;
  latestPreAnalysis: PreAnalysis | null;
  latestDeviceResponse: DeviceResponse | null;
};

export type DeviceSessions = {
  deviceId: string;
  total: number;
  sessions: SessionSummary[];
};

export type SessionLiveStatus = {
  sessionId: string;
  deviceId: string;
  status: SessionStatus;
  startedAt: Date;
  updatedAt: Date;
  lastSampleAt: Date | null;
  sampleCount: number;
  averageAmplitude: number;
  rmsAmplitude: number;
  peakIntensity: number;
  snoreEventCount: number;
  averageBreathingRate: number;
  averageTemperature: number;
  averageHumidity: number;
};

export type SessionSample = {
  recordedAt: Date;
  micRaw: number;
  micRms: number;
  micPeak: number;
  temperature: number;
  humidity: number;
  breathingRate: number;
  movementLevel: number;
  presenceDetected: boolean;
  receivedAt: Date;
  chunkId: string | null;
};

export type SessionSamplesPage = {
  sessionId: string;
  total: number;
  samples: SessionSample[];
};

export type SessionRecord = {
  session_id: string;
  device_id: string;
  status?: SessionStatus;
  started_at: string;
  updated_at: string;
  ended_at: string | null;
  sensor_events: SensorEvent[];
  latest_pre_analysis: PreAnalysis | null;
  latest_device_response: DeviceResponse | null;
  advanced_analysis: AdvancedAnalysisRecord | null;
  insight_history?: InsightHistoryEntry[] | null;
  compatibility_projection?: Record<string, unknown> | null;
};

export type SessionsResponse = {
  sessions: SessionRecord[];
  total: number;
};
