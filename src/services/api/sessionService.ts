import type {
  AdvancedAnalysisRecord,
  SessionDataRequest,
  SessionDataResponse,
  SessionRecord,
  SessionsResponse,
  SessionStartRequest,
  SessionStartResponse,
} from "../../types/session";
import type {
  AdvancedAnalysisRequestPayload,
  AdvancedAnalysisResponse,
} from "../../types/analysis";
import { cleanBackendText } from "./errors";
import { apiClient } from "./client";
import { apiEndpoints } from "./endpoints";

export type SessionListQuery = {
  limit?: number;
  skip?: number;
  device_id?: string;
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
    detailed_insights: advanced.detailed_insights.map((item) => cleanBackendText(item)),
    recommendations: advanced.recommendations.map((item) => cleanBackendText(item)),
  };
}

function sanitizeSessionRecord(session: SessionRecord): SessionRecord {
  return {
    ...session,
    latest_pre_analysis: session.latest_pre_analysis
      ? {
          ...session.latest_pre_analysis,
          summary: cleanBackendText(session.latest_pre_analysis.summary),
          flags: session.latest_pre_analysis.flags.map((item) => cleanBackendText(item)),
        }
      : null,
    latest_device_response: session.latest_device_response
      ? {
          ...session.latest_device_response,
          recommendations: session.latest_device_response.recommendations.map((item) =>
            cleanBackendText(item),
          ),
          pre_analysis: {
            ...session.latest_device_response.pre_analysis,
            summary: cleanBackendText(session.latest_device_response.pre_analysis.summary),
            flags: session.latest_device_response.pre_analysis.flags.map((item) => cleanBackendText(item)),
          },
          breathing_pattern: {
            ...session.latest_device_response.breathing_pattern,
            label: cleanBackendText(session.latest_device_response.breathing_pattern.label),
          },
        }
      : null,
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

export async function getSessions(
  query: SessionListQuery,
): Promise<SessionsResponse> {
  const { data } = await apiClient.get<SessionsResponse>(apiEndpoints.sessions, {
    params: {
      limit: query.limit,
      skip: query.skip,
      device_id: query.device_id || undefined,
    },
  });

  return {
    ...data,
    sessions: data.sessions.map((item) => sanitizeSessionRecord(item)),
  };
}

export async function getSessionById(sessionId: string): Promise<SessionRecord> {
  const { data } = await apiClient.get<SessionRecord>(
    apiEndpoints.sessionById(sessionId),
  );
  return sanitizeSessionRecord(data);
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
