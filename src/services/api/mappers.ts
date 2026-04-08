import type {
  DeviceSessions,
  DeviceSessionsResponse,
  SessionLiveStatus,
  SessionLiveStatusResponse,
  SessionSample,
  SessionSampleResponse,
  SessionSamplesPage,
  SessionSamplesPageResponse,
  SessionSummary,
  SessionSummaryMetrics,
  SessionSummaryResponse,
} from "../../types/session";

function parseIsoToDate(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ISO date received from API: ${value}`);
  }
  return parsed;
}

function parseOptionalIsoToDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  return parseIsoToDate(value);
}

function resolveSummaryMetrics(
  summary: SessionSummaryResponse,
): SessionSummaryMetrics | null {
  return (
    summary.final_summary ?? summary.backend_summary ?? summary.device_summary
  );
}

export function mapSessionSummary(
  response: SessionSummaryResponse,
): SessionSummary {
  return {
    sessionId: response.session_id,
    deviceId: response.device_id,
    status: response.status,
    startedAt: parseIsoToDate(response.started_at),
    updatedAt: parseIsoToDate(response.updated_at),
    endedAt: parseOptionalIsoToDate(response.ended_at),
    sampleCount: response.sample_count,
    deviceSummary: response.device_summary,
    backendSummary: response.backend_summary,
    finalSummary: response.final_summary,
    summaryMetrics: resolveSummaryMetrics(response),
    latestPreAnalysis: response.latest_pre_analysis,
    latestDeviceResponse: response.latest_device_response,
  };
}

export function mapDeviceSessions(
  response: DeviceSessionsResponse,
): DeviceSessions {
  return {
    deviceId: response.device_id,
    total: response.total,
    sessions: response.sessions.map(mapSessionSummary),
  };
}

export function mapSessionLiveStatus(
  response: SessionLiveStatusResponse,
): SessionLiveStatus {
  return {
    sessionId: response.session_id,
    deviceId: response.device_id,
    status: response.status,
    startedAt: parseIsoToDate(response.started_at),
    updatedAt: parseIsoToDate(response.updated_at),
    lastSampleAt: parseOptionalIsoToDate(response.last_sample_at),
    sampleCount: response.sample_count,
    averageAmplitude: response.average_amplitude,
    rmsAmplitude: response.rms_amplitude,
    peakIntensity: response.peak_intensity,
    snoreEventCount: response.snore_event_count,
    averageBreathingRate: response.average_breathing_rate,
    averageTemperature: response.average_temperature,
    averageHumidity: response.average_humidity,
  };
}

export function mapSessionSample(
  response: SessionSampleResponse,
): SessionSample {
  return {
    recordedAt: parseIsoToDate(response.recorded_at),
    micRaw: response.mic_raw,
    micRms: response.mic_rms,
    micPeak: response.mic_peak,
    temperature: response.temperature,
    humidity: response.humidity,
    breathingRate: response.breathing_rate,
    movementLevel: response.movement_level,
    presenceDetected: response.presence_detected,
    receivedAt: parseIsoToDate(response.received_at),
    chunkId: response.chunk_id,
  };
}

export function mapSessionSamplesPage(
  response: SessionSamplesPageResponse,
): SessionSamplesPage {
  return {
    sessionId: response.session_id,
    total: response.total,
    samples: response.samples.map(mapSessionSample),
  };
}
