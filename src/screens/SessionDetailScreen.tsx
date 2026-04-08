import type { RouteProp } from "@react-navigation/native";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  ComparisonBarChart,
  RangeSelector,
  SleepStageStackedChart,
  TrendLineChart,
  type ChartRange,
} from "../components/charts/InsightCharts";
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
  const [sampleRange, setSampleRange] = useState<ChartRange>("week");

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

  const slicedSamples = useMemo(() => {
    const windowSize = sampleRange === "day" ? 24 : sampleRange === "week" ? 72 : 168;
    return samples.slice(-windowSize);
  }, [sampleRange, samples]);

  const sampleLabels = useMemo(
    () =>
      slicedSamples.map((sample, index) => {
        const date = sample.recordedAt;
        if (sampleRange === "day") {
          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }

        if (sampleRange === "week") {
          return date.toLocaleDateString(undefined, { weekday: "short" });
        }

        return index % 2 === 0
          ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
          : "";
      }),
    [sampleRange, slicedSamples],
  );

  const sampleMicValues = useMemo(
    () => slicedSamples.map((item) => clamp0To100(item.micRaw)),
    [slicedSamples],
  );
  const sampleBreathingValues = useMemo(
    () => slicedSamples.map((item) => Math.max(0, item.breathingRate)),
    [slicedSamples],
  );
  const overviewComparisons = useMemo(() => {
    if (!summaryMetrics) {
      return [];
    }

    const breathingScore = clamp0To100(
      100 - Math.abs((summaryMetrics.average_breathing_rate ?? 14) - 14) * 8,
    );
    const snoreScore = clamp0To100(
      100 - (summaryMetrics.average_snore_level ?? 0) * 8,
    );
    const comfortBase =
      ((summaryMetrics.average_temperature ?? 23) +
        (summaryMetrics.average_humidity ?? 50) / 2) /
      2;
    const comfortScore = clamp0To100(100 - Math.abs(comfortBase - 24) * 4);

    return [
      {
        label: "Breath",
        value: breathingScore,
        hint: "Stability around 14 rpm generally indicates calmer cycles.",
      },
      {
        label: "Snore",
        value: snoreScore,
        hint: "Lower snore score can reduce sleep fragmentation.",
      },
      {
        label: "Comfort",
        value: comfortScore,
        hint: "Balanced temperature and humidity support deeper sleep.",
      },
    ];
  }, [summaryMetrics]);

  const stageStackData = useMemo(() => {
    if (!samples.length) {
      return [];
    }

    const windows = [
      { label: "W1", start: 0.0, end: 0.25 },
      { label: "W2", start: 0.25, end: 0.5 },
      { label: "W3", start: 0.5, end: 0.75 },
      { label: "W4", start: 0.75, end: 1.0 },
    ];

    return windows.map((window) => {
      const from = Math.floor(samples.length * window.start);
      const to = Math.max(from + 1, Math.floor(samples.length * window.end));
      const windowSamples = samples.slice(from, to);
      const avgBreathing =
        windowSamples.reduce((sum, item) => sum + item.breathingRate, 0) /
        windowSamples.length;
      const avgMic =
        windowSamples.reduce((sum, item) => sum + item.micRaw, 0) /
        windowSamples.length;
      const deep = Math.max(0.8, 2.4 - avgMic / 65);
      const rem = Math.max(0.7, 1.9 - Math.abs(avgBreathing - 14) / 9);
      const light = Math.max(1.2, 6.5 / windows.length - deep - rem);

      return {
        label: window.label,
        light: Number(light.toFixed(1)),
        deep: Number(deep.toFixed(1)),
        rem: Number(rem.toFixed(1)),
      };
    });
  }, [samples]);

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

              {overviewComparisons.length ? (
                <ComparisonBarChart
                  title="Session Balance"
                  data={overviewComparisons}
                  summary="Tap bars to inspect breathing, snore, and comfort contributors."
                />
              ) : null}

              {stageStackData.length ? (
                <SleepStageStackedChart
                  title="Estimated Stage Profile"
                  data={stageStackData}
                  summary="Estimated light/deep/REM composition across this session timeline."
                />
              ) : null}

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
                  <AgapCard>
                    <Text className="text-[11px] uppercase tracking-[1px] text-[#8FAAD2]">
                      Sample Window
                    </Text>
                    <View className="mt-3 self-start">
                      <RangeSelector value={sampleRange} onChange={setSampleRange} />
                    </View>
                  </AgapCard>

                  <TrendLineChart
                    title="Mic Intensity"
                    values={sampleMicValues}
                    labels={sampleLabels}
                    summary="Normalized microphone intensity across selected sample range."
                    annotation={`Presence detected at ${presenceDetectedCount} points`}
                  />

                  <TrendLineChart
                    title="Breathing Rate"
                    values={sampleBreathingValues}
                    labels={sampleLabels}
                    summary="Breathing rhythm sampled over the selected session window."
                    annotation={
                      avgMovementLevel !== null
                        ? `Average movement level ${avgMovementLevel.toFixed(2)}`
                        : undefined
                    }
                  />

                  <ComparisonBarChart
                    title="Environment Snapshot"
                    data={[
                      {
                        label: "Temp",
                        value:
                          temperatureValues.length > 0
                            ? Math.max(
                                0,
                                Math.min(
                                  100,
                                  (temperatureValues[temperatureValues.length - 1] / 35) * 100,
                                ),
                              )
                            : 0,
                        hint: "Normalized latest room temperature reading.",
                      },
                      {
                        label: "Humidity",
                        value:
                          humidityValues.length > 0
                            ? Math.max(
                                0,
                                Math.min(100, humidityValues[humidityValues.length - 1]),
                              )
                            : 0,
                        hint: "Latest humidity percentage from sample stream.",
                      },
                      {
                        label: "Motion",
                        value:
                          avgMovementLevel !== null
                            ? Math.max(0, Math.min(100, avgMovementLevel * 10))
                            : 0,
                        hint: "Movement level normalized to 0-100 scale.",
                      },
                    ]}
                    summary="Current environment and motion indicators from sampled data."
                  />

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
