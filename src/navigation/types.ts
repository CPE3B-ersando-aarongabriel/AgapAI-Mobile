import type { NavigatorScreenParams } from "@react-navigation/native";
import type { AdvancedAnalysisRequestPayload } from "../types/analysis";

export type MainTabParamList = {
  HomeDashboard: undefined;
  SessionHistory: undefined;
  InsightChat: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  SessionDetail: { sessionId?: string } | undefined;
  AdvancedAnalysisInput: { sessionId?: string } | undefined;
  AdvancedAnalysisLoading:
    | {
        requestId?: string;
        sessionId?: string;
        payload?: AdvancedAnalysisRequestPayload;
      }
    | undefined;
};
