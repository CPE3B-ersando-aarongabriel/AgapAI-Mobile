import type { RouteProp } from "@react-navigation/native";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SleepTrendBars } from "../components/charts/SleepTrendBars";
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
import { useSessionLive } from "../hooks/useSessionLive";
import { useSessionSamples } from "../hooks/useSessionSamples";
import type { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store/appStore";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, "SessionDetail">;

type DetailSection = "overview" | "live" | "samples" | "insights";

function toDisplayValue(
  value?: number | null,
  suffix = "",
  digits = 1,
): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Unavailable";
  }
  return `${value.toFixed(digits)}${suffix}`;
}

function clamp0To100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function SessionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const route = useRoute<DetailRoute>();
  const { setSelectedSessionId } = useAppStore();
  const sessionId = route.params?.sessionId;
  const { session, isLoading, error, refresh } = useSessionDetail(sessionId);
  const [section, setSection] = useState<DetailSection>("overview");

  const isActiveSession = session?.status === "active";
  const {
    live,
    isLoading: isLiveLoading,
    error: liveError,
    refresh: refreshLive,
  } = useSessionLive(sessionId, {
    enabled: Boolean(sessionId && isFocused && isActiveSession),
    pollIntervalMs: 5000,
  });

  const {
    samples,
    total: totalSamples,
    isLoading: isSamplesLoading,
    isLoadingMore,
    hasMore,
    error: samplesError,
    refresh: refreshSamples,
    loadMore,
  } = useSessionSamples(sessionId, { pageSize: 200 });

  const summaryMetrics = session?.summaryMetrics;

  const normalizedMicValues = useMemo(
    () => samples.slice(-14).map((item) => clamp0To100(item.micRaw)),
    [samples],
  );
  const breathingValues = useMemo(
    () => samples.slice(-14).map((item) => Math.max(0, item.breathingRate)),
    [samples],
  );
  const temperatureValues = useMemo(
    () => samples.slice(-14).map((item) => item.temperature),
    [samples],
  );
  const humidityValues = useMemo(
    () => samples.slice(-14).map((item) => item.humidity),
    [samples],
  );
  const presenceDetectedCount = useMemo(
    () => samples.filter((item) => item.presenceDetected).length,
    [samples],
  );
  const avgMovementLevel = useMemo(() => {
    if (!samples.length) {
      return null;
    }
    const total = samples.reduce((sum, item) => sum + item.movementLevel, 0);
    return total / samples.length;
  }, [samples]);

  const riskLevel = session?.latestPreAnalysis?.risk_level ?? "medium";

  return (
    <ScreenContainer scrollable>
      <AgapHeader
        showBack
        onBackPress={() => navigation.goBack()}
        title={
          session
            ? `Session ${session.startedAt.toLocaleDateString()}`
            : "Session Detail"
        }
        subtitle={
          session?.latestPreAnalysis?.summary ||
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
          <View className="mb-4 flex-row flex-wrap gap-2">
            {(
              ["overview", "live", "samples", "insights"] as DetailSection[]
            ).map((item) => (
              <Pressable
                key={item}
                onPress={() => setSection(item)}
                className={`rounded-full border px-3 py-2 ${
                  section === item
                    ? "border-[#5F9DFF] bg-[#214883]"
                    : "border-[#2F4D7D] bg-[#122C56]"
                }`}
              >
                <Text className="text-[11px] uppercase tracking-[1px] text-[#D8E6FF]">
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <RiskBadge level={riskLevel} />
            <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
              Device {session.deviceId}
            </Text>
          </View>

          {section === "overview" ? (
            <>
              <View className="mb-3 flex-row gap-3">
                <SessionMetricTile
                  label="Breathing"
                  value={toDisplayValue(
                    summaryMetrics?.average_breathing_rate,
                    " rpm",
                  )}
                />
                <SessionMetricTile
                  label="Snore Level"
                  value={toDisplayValue(
                    summaryMetrics?.average_snore_level,
                    " / 100",
                  )}
                />
              </View>

              <View className="mb-4 flex-row gap-3">
                <SessionMetricTile
                  label="Room Temp"
                  value={toDisplayValue(
                    summaryMetrics?.average_temperature,
                    " C",
                  )}
                />
                <SessionMetricTile
                  label="Humidity"
                  value={toDisplayValue(
                    summaryMetrics?.average_humidity,
                    "%",
                    0,
                  )}
                />
              </View>

              <BreathingPatternCard
                pattern={
                  session.latestDeviceResponse?.breathing_pattern ?? null
                }
              />

              <View className="mt-4">
                <RecommendationList
                  title="Device Recommendations"
                  items={session.latestDeviceResponse?.recommendations ?? []}
                />
              </View>

              <View className="mt-4">
                <AgapButton
                  title="Refresh Summary"
                  variant="secondary"
                  onPress={() => void refresh()}
                />
              </View>
            </>
          ) : null}

          {section === "live" ? (
            <>
              {!isActiveSession ? (
                <EmptyState
                  title="Session has ended"
                  description="Live polling is available only while a session is active."
                />
              ) : null}

              {isActiveSession && isLiveLoading ? (
                <LoadingState label="Fetching live metrics..." />
              ) : null}

              {isActiveSession && liveError ? (
                <ErrorState
                  message={liveError.message}
                  onRetry={() => void refreshLive()}
                />
              ) : null}

              {isActiveSession && !isLiveLoading && !liveError && live ? (
                <>
                  <View className="mb-3 flex-row gap-3">
                    <SessionMetricTile
                      label="Live Breathing"
                      value={toDisplayValue(live.averageBreathingRate, " rpm")}
                    />
                    <SessionMetricTile
                      label="Live Peak"
                      value={toDisplayValue(live.peakIntensity, " / 100")}
                    />
                  </View>
                  <View className="mb-3 flex-row gap-3">
                    <SessionMetricTile
                      label="Snore Events"
                      value={`${live.snoreEventCount}`}
                    />
                    <SessionMetricTile
                      label="Samples"
                      value={`${live.sampleCount}`}
                    />
                  </View>
                  <View className="mb-3 flex-row gap-3">
                    <SessionMetricTile
                      label="Temp"
                      value={toDisplayValue(live.averageTemperature, " C")}
                    />
                    <SessionMetricTile
                      label="Humidity"
                      value={toDisplayValue(live.averageHumidity, "%", 0)}
                    />
                  </View>
                  <AgapButton
                    title="Refresh Live"
                    variant="secondary"
                    onPress={() => void refreshLive()}
                  />
                </>
              ) : null}
            </>
          ) : null}

          {section === "samples" ? (
            <>
              {isSamplesLoading ? (
                <LoadingState label="Loading sample stream..." />
              ) : null}

              {!isSamplesLoading && samplesError ? (
                <ErrorState
                  message={samplesError.message}
                  onRetry={() => void refreshSamples()}
                />
              ) : null}

              {!isSamplesLoading && !samplesError && !samples.length ? (
                <EmptyState
                  title="No samples available"
                  description="No streamed sample rows were found for this session yet."
                  actionLabel="Refresh"
                  onAction={() => void refreshSamples()}
                />
              ) : null}

              {!isSamplesLoading && !samplesError && samples.length ? (
                <>
                  <SleepTrendBars
                    values={normalizedMicValues}
                    subtitle="Mic raw intensity trend (normalized 0-100)"
                  />
                  <View className="mt-3">
                    <SleepTrendBars
                      values={breathingValues}
                      subtitle="Breathing rate trend"
                    />
                  </View>
                  <View className="mt-3">
                    <SleepTrendBars
                      values={temperatureValues}
                      subtitle="Temperature trend"
                    />
                  </View>
                  <View className="mt-3">
                    <SleepTrendBars
                      values={humidityValues}
                      subtitle="Humidity trend"
                    />
                  </View>

                  <AgapCard className="mt-4">
                    <Text className="text-[11px] uppercase tracking-[1px] text-[#8FA6CC]">
                      Sample Stats
                    </Text>
                    <Text className="mt-2 text-sm text-[#D8E7FF]">
                      Loaded {samples.length} / {totalSamples}
                    </Text>
                    <Text className="mt-1 text-sm text-[#D8E7FF]">
                      Presence detected points: {presenceDetectedCount}
                    </Text>
                    <Text className="mt-1 text-sm text-[#D8E7FF]">
                      Avg movement level:{" "}
                      {toDisplayValue(avgMovementLevel, "", 2)}
                    </Text>
                  </AgapCard>

                  <View className="mt-4 gap-3">
                    <AgapButton
                      title="Refresh Samples"
                      variant="secondary"
                      onPress={() => void refreshSamples()}
                    />
                    {hasMore ? (
                      <AgapButton
                        title={
                          isLoadingMore
                            ? "Loading more..."
                            : "Load More Samples"
                        }
                        onPress={() => void loadMore()}
                        disabled={isLoadingMore}
                        isLoading={isLoadingMore}
                      />
                    ) : null}
                  </View>
                </>
              ) : null}
            </>
          ) : null}

          {section === "insights" ? (
            <>
              <AgapCard className="mt-1">
                <Text className="text-[11px] uppercase tracking-[1px] text-[#8FA6CC]">
                  AI Coach Insights
                </Text>
                <View className="mt-3 gap-2">
                  <View className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3">
                    <Text className="text-xs leading-5 text-[#D8E7FF]">
                      {session.latestPreAnalysis?.summary ||
                        "No pre-analysis summary available yet."}
                    </Text>
                  </View>
                  {session.latestPreAnalysis?.flags.map((flag) => (
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

              <View className="mt-4 gap-3">
                <AgapButton
                  title="Advanced AI Analysis"
                  onPress={() =>
                    navigation.navigate("AdvancedAnalysisInput", {
                      sessionId: session.sessionId,
                    })
                  }
                />
                <AgapButton
                  title="Open Insight Chat"
                  variant="secondary"
                  onPress={() => {
                    setSelectedSessionId(session.sessionId);
                    navigation.navigate("MainTabs", { screen: "InsightChat" });
                  }}
                />
              </View>
            </>
          ) : null}
        </>
      ) : null}
    </ScreenContainer>
  );
}
