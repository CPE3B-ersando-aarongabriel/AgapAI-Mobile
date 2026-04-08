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
    RangeSelector,
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

export function SessionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const route = useRoute<DetailRoute>();
  const { setSelectedSessionId } = useAppStore();
  const sessionId = route.params?.sessionId;
  const { session, isLoading, error, refresh } = useSessionDetail(sessionId);
  const [section, setSection] = useState<DetailSection>("overview");
  const [sampleRange, setSampleRange] = useState<ChartRange>("week");

  const isActiveSession =
    session?.status !== "ended" && session?.status !== "completed";

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

  const slicedSamples = useMemo(() => {
    const windowSize =
      sampleRange === "day" ? 120 : sampleRange === "week" ? 500 : 1200;
    return samples.slice(-windowSize);
  }, [sampleRange, samples]);

  const sampleLabels = useMemo(() => {
    return slicedSamples.map((sample, index) => {
      const date = sample.recordedAt;
      if (index % 8 !== 0 && index !== slicedSamples.length - 1) {
        return "";
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    });
  }, [slicedSamples]);

  const sampleTimeValues = useMemo(
    () => slicedSamples.map((item) => item.recordedAt.getTime()),
    [slicedSamples],
  );

  const sampleMicRawValues = useMemo(
    () => slicedSamples.map((item) => item.micRaw),
    [slicedSamples],
  );

  const sampleBreathingValues = useMemo(
    () => slicedSamples.map((item) => item.breathingRate),
    [slicedSamples],
  );

  const sampleTemperatureValues = useMemo(
    () => slicedSamples.map((item) => item.temperature),
    [slicedSamples],
  );

  const sampleHumidityValues = useMemo(
    () => slicedSamples.map((item) => item.humidity),
    [slicedSamples],
  );

  const latestSample = samples[samples.length - 1] ?? null;

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
          session
            ? `Status: ${session.status} • Device: ${session.deviceId}`
            : "Detailed session analytics"
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
            {session.latestPreAnalysis?.risk_level ? (
              <RiskBadge level={session.latestPreAnalysis.risk_level} />
            ) : (
              <Text className="text-xs text-[#9FB5D6]">
                No risk signal available yet
              </Text>
            )}
            <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
              Samples {session.sampleCount}
            </Text>
          </View>

          {section === "overview" ? (
            <>
              <View className="mb-3 flex-row gap-3">
                <SessionMetricTile
                  label="Avg Breathing"
                  value={toDisplayValue(
                    summaryMetrics?.average_breathing_rate,
                    " rpm",
                  )}
                />
                <SessionMetricTile
                  label="Snore Score"
                  value={toDisplayValue(summaryMetrics?.snore_score)}
                />
              </View>

              <View className="mb-3 flex-row gap-3">
                <SessionMetricTile
                  label="Avg Temp"
                  value={toDisplayValue(summaryMetrics?.average_temperature, " C")}
                />
                <SessionMetricTile
                  label="Avg Humidity"
                  value={toDisplayValue(summaryMetrics?.average_humidity, "%", 0)}
                />
              </View>

              <View className="mb-3 flex-row gap-3">
                <SessionMetricTile
                  label="Peak Intensity"
                  value={toDisplayValue(summaryMetrics?.peak_intensity)}
                />
                <SessionMetricTile
                  label="Snore Events"
                  value={toDisplayValue(summaryMetrics?.snore_event_count, "", 0)}
                />
              </View>

              <BreathingPatternCard
                pattern={session.latestDeviceResponse?.breathing_pattern ?? null}
              />

              <View className="mt-4">
                <RecommendationList
                  title="Session Recommendations"
                  items={session.latestDeviceResponse?.recommendations ?? []}
                  emptyMessage="No recommendations returned by backend for this session yet."
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
                  title="Session is not active"
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
                      label="Avg Breathing"
                      value={toDisplayValue(live.averageBreathingRate, " rpm")}
                    />
                    <SessionMetricTile
                      label="Avg Amplitude"
                      value={toDisplayValue(live.averageAmplitude)}
                    />
                  </View>

                  <View className="mb-3 flex-row gap-3">
                    <SessionMetricTile
                      label="RMS"
                      value={toDisplayValue(live.rmsAmplitude)}
                    />
                    <SessionMetricTile
                      label="Peak Intensity"
                      value={toDisplayValue(live.peakIntensity)}
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
                  description="No sample rows were returned for this session yet."
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
                    title="Mic Raw"
                    values={sampleMicRawValues}
                    labels={sampleLabels}
                    xValues={sampleTimeValues}
                    summary="Raw microphone signal from streamed samples."
                  />

                  <TrendLineChart
                    title="Breathing Rate"
                    values={sampleBreathingValues}
                    labels={sampleLabels}
                    xValues={sampleTimeValues}
                    summary="Breathing rate from streamed samples."
                  />

                  <TrendLineChart
                    title="Temperature"
                    values={sampleTemperatureValues}
                    labels={sampleLabels}
                    xValues={sampleTimeValues}
                    summary="Temperature values from streamed samples."
                  />

                  <TrendLineChart
                    title="Humidity"
                    values={sampleHumidityValues}
                    labels={sampleLabels}
                    xValues={sampleTimeValues}
                    summary="Humidity values from streamed samples."
                  />

                  <AgapCard className="mt-4">
                    <Text className="text-[11px] uppercase tracking-[1px] text-[#8FA6CC]">
                      Sample Stats
                    </Text>
                    <Text className="mt-2 text-sm text-[#D8E7FF]">
                      Loaded {samples.length} / {totalSamples}
                    </Text>
                    {latestSample ? (
                      <Text className="mt-1 text-sm text-[#D8E7FF]">
                        Latest sample at {latestSample.recordedAt.toLocaleTimeString()}
                      </Text>
                    ) : null}
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
                          isLoadingMore ? "Loading more..." : "Load More Samples"
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
              {session.latestPreAnalysis ? (
                <AgapCard className="mt-1">
                  <Text className="text-[11px] uppercase tracking-[1px] text-[#8FA6CC]">
                    Pre-Analysis
                  </Text>
                  <View className="mt-3 gap-2">
                    <View className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3">
                      <Text className="text-xs leading-5 text-[#D8E7FF]">
                        {session.latestPreAnalysis.summary}
                      </Text>
                    </View>
                    {session.latestPreAnalysis.flags.map((flag) => (
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
              ) : (
                <EmptyState
                  title="No pre-analysis yet"
                  description="This session does not have a pre-analysis payload yet."
                />
              )}

              <AgapCard className="mt-4">
                <Text className="text-xs leading-6 text-[#A8C0E5]">
                  Insights are coaching guidance and not a medical diagnosis.
                </Text>
              </AgapCard>

              <View className="mt-4 gap-3">
                <AgapButton
                  title="Advanced Analysis"
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
