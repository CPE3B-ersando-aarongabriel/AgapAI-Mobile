import type {
  AdvancedAnalysisRequestPayload,
  AdvancedAnalysisResponse,
} from "../../types/analysis";
import type { InsightChatRequest, InsightChatResponse } from "../../types/chat";
import type {
  AdvancedAnalysisRecord,
  DeviceResponse,
  DeviceSessions,
  DeviceSessionsResponse,
  PreAnalysis,
  SessionDataRequest,
  SessionDataResponse,
  SessionLiveStatus,
  SessionLiveStatusResponse,
  SessionRecord,
  SessionSamplesPage,
  SessionSamplesPageResponse,
  SessionsResponse,
  SessionStartRequest,
  SessionStartResponse,
  SessionSummary,
  SessionSummaryResponse,
} from "../../types/session";
import { apiClient } from "./client";
import { apiEndpoints } from "./endpoints";
import { cleanBackendText } from "./errors";
import {
  mapDeviceSessions,
  mapSessionLiveStatus,
  mapSessionSamplesPage,
  mapSessionSummary,
} from "./mappers";
import { withGetRetry } from "./retry";

export type SessionListQuery = {
  limit?: number;
  skip?: number;
  device_id?: string;
};

export type DeviceSessionListQuery = {
  limit?: number;
  skip?: number;
};

export type SessionSamplesQuery = {
  limit?: number;
  skip?: number;
};

type RequestOptions = {
  signal?: AbortSignal;
};

function sanitizeAdvanced(
  advanced: AdvancedAnalysisRecord | AdvancedAnalysisResponse | null,
): AdvancedAnalysisRecord | null {
  if (!advanced) {
    return null;
  }

  return {
    ...advanced,
    confidence_note: cleanBackendText(advanced.confidence_note),
    detailed_insights: advanced.detailed_insights.map((item) =>
      cleanBackendText(item),
    ),
    recommendations: advanced.recommendations.map((item) =>
      cleanBackendText(item),
    ),
  };
}

function sanitizePreAnalysis(pre: PreAnalysis | null): PreAnalysis | null {
  if (!pre) {
    return null;
  }

  return {
    ...pre,
    summary: cleanBackendText(pre.summary),
    flags: pre.flags.map((item) => cleanBackendText(item)),
  };
}

function sanitizeDeviceResponse(
  response: DeviceResponse | null,
): DeviceResponse | null {
  if (!response) {
    return null;
  }

  return {
    ...response,
    recommendations: response.recommendations.map((item) =>
      cleanBackendText(item),
    ),
    pre_analysis: {
      ...response.pre_analysis,
      summary: cleanBackendText(response.pre_analysis.summary),
      flags: response.pre_analysis.flags.map((item) => cleanBackendText(item)),
    },
    breathing_pattern: {
      ...response.breathing_pattern,
      label: cleanBackendText(response.breathing_pattern.label),
    },
  };
}

function sanitizeSessionSummaryResponse(
  summary: SessionSummaryResponse,
): SessionSummaryResponse {
  return {
    ...summary,
    latest_pre_analysis: sanitizePreAnalysis(summary.latest_pre_analysis),
    latest_device_response: sanitizeDeviceResponse(
      summary.latest_device_response,
    ),
  };
}

function sanitizeSessionRecord(session: SessionRecord): SessionRecord {
  return {
    ...session,
    latest_pre_analysis: sanitizePreAnalysis(session.latest_pre_analysis),
    latest_device_response: sanitizeDeviceResponse(
      session.latest_device_response,
    ),
    advanced_analysis: sanitizeAdvanced(session.advanced_analysis),
  };
}

export async function startSession(
  payload: SessionStartRequest,
): Promise<SessionStartResponse> {
  const { data } = await apiClient.post<SessionStartResponse>(
    apiEndpoints.sessionStart,
    payload,
  );
  return data;
}

export async function submitSessionData(
  payload: SessionDataRequest,
): Promise<SessionDataResponse> {
  const { data } = await apiClient.post<SessionDataResponse>(
    apiEndpoints.sessionData,
    payload,
  );

  return {
    ...data,
    recommendations: data.recommendations.map((item) => cleanBackendText(item)),
    breathing_pattern: {
      ...data.breathing_pattern,
      label: cleanBackendText(data.breathing_pattern.label),
    },
    pre_analysis: {
      ...data.pre_analysis,
      summary: cleanBackendText(data.pre_analysis.summary),
      flags: data.pre_analysis.flags.map((item) => cleanBackendText(item)),
    },
  };
}

export async function getDeviceSessions(
  deviceId: string,
  query: DeviceSessionListQuery = {},
  options: RequestOptions = {},
): Promise<DeviceSessions> {
  const response = await withGetRetry(() =>
    apiClient.get<DeviceSessionsResponse>(
      apiEndpoints.deviceSessions(deviceId),
      {
        params: {
          limit: query.limit,
          skip: query.skip,
        },
        signal: options.signal,
      },
    ),
  );

  return mapDeviceSessions({
    ...response.data,
    sessions: response.data.sessions.map((item) =>
      sanitizeSessionSummaryResponse(item),
    ),
  });
}

export async function getSessionSummary(
  sessionId: string,
  options: RequestOptions = {},
): Promise<SessionSummary> {
  const response = await withGetRetry(() =>
    apiClient.get<SessionSummaryResponse>(
      apiEndpoints.sessionSummary(sessionId),
      {
        signal: options.signal,
      },
    ),
  );

  return mapSessionSummary(sanitizeSessionSummaryResponse(response.data));
}

export async function getSessionLiveStatus(
  sessionId: string,
  options: RequestOptions = {},
): Promise<SessionLiveStatus> {
  const response = await withGetRetry(() =>
    apiClient.get<SessionLiveStatusResponse>(
      apiEndpoints.sessionLive(sessionId),
      {
        signal: options.signal,
      },
    ),
  );

  return mapSessionLiveStatus(response.data);
}

export async function getSessionSamples(
  sessionId: string,
  query: SessionSamplesQuery = {},
  options: RequestOptions = {},
): Promise<SessionSamplesPage> {
  const limit = Math.min(2000, Math.max(1, query.limit ?? 200));
  const skip = Math.max(0, query.skip ?? 0);

  const response = await withGetRetry(() =>
    apiClient.get<SessionSamplesPageResponse>(
      apiEndpoints.sessionSamples(sessionId),
      {
        params: {
          limit,
          skip,
        },
        signal: options.signal,
      },
    ),
  );

  return mapSessionSamplesPage(response.data);
}

export async function getSessions(
  query: SessionListQuery,
): Promise<SessionsResponse> {
  const response = await withGetRetry(() =>
    apiClient.get<SessionsResponse>(apiEndpoints.sessions, {
      params: {
        limit: query.limit,
        skip: query.skip,
        device_id: query.device_id || undefined,
      },
    }),
  );

  const { data } = response;

  return {
    ...data,
    sessions: data.sessions.map((item) => sanitizeSessionRecord(item)),
  };
}

export async function getSessionById(
  sessionId: string,
): Promise<SessionRecord> {
  const response = await withGetRetry(() =>
    apiClient.get<SessionRecord>(apiEndpoints.sessionById(sessionId)),
  );
  return sanitizeSessionRecord(response.data);
}

export async function requestAdvancedAnalysis(
  sessionId: string,
  payload: AdvancedAnalysisRequestPayload,
): Promise<AdvancedAnalysisRecord> {
  const { data } = await apiClient.post<AdvancedAnalysisResponse>(
    apiEndpoints.sessionAdvanced(sessionId),
    payload,
  );

  return sanitizeAdvanced(data) as AdvancedAnalysisRecord;
}

export async function requestInsightChat(
  payload: InsightChatRequest,
): Promise<InsightChatResponse> {
  const { data } = await apiClient.post<InsightChatResponse>(
    apiEndpoints.insightChat,
    payload,
  );

  return {
    ...data,
    question: cleanBackendText(data.question),
    answer: cleanBackendText(data.answer),
  };
}
