import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { AgapButton } from "../components/common/AgapButton";
import { AgapCard } from "../components/common/AgapCard";
import { AgapHeader } from "../components/common/AgapHeader";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { BreathingPatternCard } from "../components/session/BreathingPatternCard";
import { RecommendationList } from "../components/session/RecommendationList";
import { RiskBadge } from "../components/session/RiskBadge";
import { SessionMetricTile } from "../components/session/SessionMetricTile";
import { useSessionDetail } from "../hooks/useSessionDetail";
import type { RootStackParamList } from "../navigation/types";
import type { SessionRecord } from "../types/session";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, "SessionDetail">;

function getLastSensorEvent(session: SessionRecord) {
  return session.sensor_events.length
    ? session.sensor_events[session.sensor_events.length - 1]
    : null;
}

export function SessionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const sessionId = route.params?.sessionId;
  const { session, isLoading, error, refresh } = useSessionDetail(sessionId);

  const lastEvent = session ? getLastSensorEvent(session) : null;
  const riskLevel = session?.latest_pre_analysis?.risk_level ?? "medium";

  return (
    <ScreenContainer scrollable>
      <AgapHeader
        showBack
        onBackPress={() => navigation.goBack()}
        title={
          session
            ? `Session ${new Date(session.started_at).toLocaleDateString()}`
            : "Session Detail"
        }
        subtitle={
          session?.latest_pre_analysis?.summary ||
          "Detailed analytics for this selected sleep session"
        }
      />

      {isLoading ? <LoadingState label="Loading session details..." /> : null}

      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={() => void refresh()} />
      ) : null}

      {!isLoading && !error && !session ? (
        <EmptyState
          title="Session not available"
          description="This session could not be found. It may not have been generated yet."
          actionLabel="Back to History"
          onAction={() =>
            navigation.navigate("MainTabs", { screen: "SessionHistory" })
          }
        />
      ) : null}

      {!isLoading && !error && session ? (
        <>
          <View className="mb-4 flex-row items-center justify-between">
            <RiskBadge level={riskLevel} />
            <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
              Device {session.device_id}
            </Text>
          </View>

          <View className="mb-3 flex-row gap-3">
            <SessionMetricTile
              label="Breathing"
              value={
                lastEvent
                  ? `${lastEvent.breathing_rate.toFixed(1)} rpm`
                  : "Unavailable"
              }
            />
            <SessionMetricTile
              label="Snore Level"
              value={
                lastEvent
                  ? `${lastEvent.snore_level.toFixed(1)} / 10`
                  : "Unavailable"
              }
            />
          </View>

          <View className="mb-4 flex-row gap-3">
            <SessionMetricTile
              label="Room Temp"
              value={
                lastEvent
                  ? `${lastEvent.temperature.toFixed(1)} C`
                  : "Unavailable"
              }
            />
            <SessionMetricTile
              label="Humidity"
              value={
                lastEvent ? `${lastEvent.humidity.toFixed(0)}%` : "Unavailable"
              }
            />
          </View>

          <BreathingPatternCard
            pattern={session.latest_device_response?.breathing_pattern ?? null}
          />

          <View className="mt-4">
            <RecommendationList
              title="Device Recommendations"
              items={session.latest_device_response?.recommendations ?? []}
            />
          </View>

          <AgapCard className="mt-4">
            <Text className="text-[11px] uppercase tracking-[1px] text-[#8FA6CC]">
              AI Coach Insights
            </Text>
            <View className="mt-3 gap-2">
              <View className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3">
                <Text className="text-xs leading-5 text-[#D8E7FF]">
                  {session.latest_pre_analysis?.summary ||
                    "No pre-analysis summary available yet."}
                </Text>
              </View>
              {session.latest_pre_analysis?.flags.map((flag) => (
                <View
                  key={flag}
                  className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3"
                >
                  <Text className="text-xs leading-5 text-[#D8E7FF]">
                    • {flag}
                  </Text>
                </View>
              ))}
            </View>
          </AgapCard>

          <AgapCard className="mt-4">
            <Text className="text-[11px] uppercase tracking-[1px] text-[#8FA6CC]">
              Advanced AI Analysis Results
            </Text>
            {session.advanced_analysis ? (
              <>
                <View className="mt-3 gap-2">
                  {session.advanced_analysis.detailed_insights.map(
                    (insight) => (
                      <View
                        key={insight}
                        className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3"
                      >
                        <Text className="text-xs leading-5 text-[#D8E7FF]">
                          {insight}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
                <View className="mt-4">
                  <RecommendationList
                    title="Behavioral Suggestions"
                    items={session.advanced_analysis.recommendations}
                    emptyMessage="No advanced recommendations were returned."
                  />
                </View>
                <Text className="mt-3 text-xs text-[#9FB5D6]">
                  {session.advanced_analysis.confidence_note}
                </Text>
              </>
            ) : (
              <Text className="mt-3 text-sm text-[#A6BDDF]">
                No advanced analysis generated yet for this session.
              </Text>
            )}
          </AgapCard>

          <View className="mt-5">
            <AgapButton
              title="Advanced AI Analysis"
              onPress={() =>
                navigation.navigate("AdvancedAnalysisInput", {
                  sessionId: session.session_id,
                })
              }
            />
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}
