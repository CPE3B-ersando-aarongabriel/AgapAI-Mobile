import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import {
  ComparisonBarChart,
  RangeSelector,
  SleepStagePieChart,
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
import { SummaryTile } from "../components/common/SummaryTile";
import { useDashboard } from "../hooks/useDashboard";
import { useServiceStatus } from "../hooks/useServiceStatus";
import type { RootStackParamList } from "../navigation/types";
import { formatScore } from "../utils/formatters";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function estimateScore(
  avgBreathingRate: number,
  avgSnoreLevel: number,
): number {
  return clampScore(
    100 - avgSnoreLevel * 3 - Math.abs(avgBreathingRate - 14) * 2,
  );
}

export function HomeDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const [range, setRange] = useState<ChartRange>("week");
  const {
    dashboard,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard,
  } = useDashboard();
  const {
    rootInfo,
    health,
    isLoading: isStatusLoading,
    error: statusError,
    refresh: refreshStatus,
  } = useServiceStatus();

  const isLoading = isDashboardLoading || isStatusLoading;
  const error = dashboardError ?? statusError;
  const latestHighlight = dashboard?.latest_highlights[0];
  const estimatedScore = dashboard
    ? estimateScore(
        dashboard.average_breathing_rate,
        dashboard.average_snore_level,
      )
    : null;
  const healthLabel = health?.status === "healthy" ? "Online" : "Check";

  const filteredTrends = useMemo(() => {
    if (!dashboard?.trends.length) {
      return [];
    }

    const windowSize = range === "day" ? 4 : range === "week" ? 7 : 30;
    return dashboard.trends.slice(-windowSize);
  }, [dashboard?.trends, range]);

  const breathingTrendValues = useMemo(
    () =>
      filteredTrends.map((item) => Number(item.avg_breathing_rate.toFixed(1))),
    [filteredTrends],
  );
  const trendLabels = useMemo(
    () =>
      filteredTrends.map((item) =>
        new Date(item.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      ),
    [filteredTrends],
  );
  const averageTrendBreathing =
    breathingTrendValues.length > 0
      ? breathingTrendValues.reduce((sum, value) => sum + value, 0) /
        breathingTrendValues.length
      : null;

  const comparisonData = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        label: "Breath",
        value: clampScore(
          100 - Math.abs(dashboard.average_breathing_rate - 14) * 7,
        ),
        hint: "Closer to 14 rpm suggests steadier respiratory rhythm.",
      },
      {
        label: "Snore",
        value: clampScore(100 - dashboard.average_snore_level * 10),
        hint: "Lower snore levels generally reduce nighttime interruptions.",
      },
      {
        label: "Recovery",
        value: estimatedScore ?? 0,
        hint: "Blended score from breathing rhythm and snore intensity.",
      },
    ];
  }, [dashboard, estimatedScore]);

  const stageData = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const deep = Math.max(14, Math.min(30, 28 - dashboard.average_snore_level));
    const rem = Math.max(
      16,
      Math.min(30, 22 - Math.abs(dashboard.average_breathing_rate - 14) / 2),
    );
    const light = Math.max(35, 100 - deep - rem);

    return [
      { label: "Light", value: Math.round(light), color: "#A7C6ED" },
      { label: "Deep", value: Math.round(deep), color: "#4B79BF" },
      { label: "REM", value: Math.round(rem), color: "#8B86F4" },
    ];
  }, [dashboard]);

  return (
    <ScreenContainer scrollable>
      <AgapHeader
        title="AgapAI"
        subtitle={
          rootInfo?.environment
            ? `Backend: ${rootInfo.environment}`
            : "Sleep analytics powered by your latest sessions"
        }
        rightLabel={healthLabel}
      />

      {isLoading ? (
        <LoadingState label="Syncing dashboard from backend..." />
      ) : null}

      {!isLoading && error ? (
        <ErrorState
          message={error.message}
          onRetry={() => {
            void refreshDashboard();
            void refreshStatus();
          }}
        />
      ) : null}

      {!isLoading && !error && !dashboard ? (
        <EmptyState
          title="No dashboard data yet"
          description="Start collecting sessions from your device and your dashboard metrics will appear here."
          actionLabel="View Session History"
          onAction={() =>
            navigation.navigate("MainTabs", { screen: "SessionHistory" })
          }
        />
      ) : null}

      {!isLoading && !error && dashboard ? (
        <>
          <AgapCard className="items-center">
            <View className="h-36 w-36 items-center justify-center rounded-full border-[7px] border-[#5A94EA]">
              <Text className="text-5xl font-semibold text-[#F5F8FF]">
                {estimatedScore !== null ? estimatedScore : "--"}
              </Text>
              <Text className="mt-1 text-xs uppercase tracking-[1px] text-[#8FA6CC]">
                Sleep Score
              </Text>
            </View>
            <View className="mt-3 flex-row gap-2">
              <View className="rounded-full bg-[#193765] px-3 py-1">
                <Text className="text-[11px] text-[#D9E7FF]">
                  {dashboard.total_sessions} Sessions
                </Text>
              </View>
              <View className="rounded-full bg-[#193765] px-3 py-1">
                <Text className="text-[11px] text-[#D9E7FF]">
                  Snore Avg{" "}
                  {formatScore(100 - dashboard.average_snore_level * 4)}
                </Text>
              </View>
            </View>
          </AgapCard>

          <View className="mt-4 flex-row gap-3">
            <SummaryTile
              label="Avg Breathing"
              value={`${dashboard.average_breathing_rate.toFixed(1)} rpm`}
            />
            <SummaryTile
              label="Avg Snore"
              value={`${dashboard.average_snore_level.toFixed(1)} / 10`}
            />
          </View>

          <AgapCard className="mt-4">
            <Text className="text-[11px] uppercase tracking-[1px] text-[#8FAAD2]">
              Trend Window
            </Text>
            <View className="mt-3 self-start">
              <RangeSelector value={range} onChange={setRange} />
            </View>
          </AgapCard>

          {latestHighlight ? (
            <AgapCard className="mt-4">
              <Text className="text-base font-semibold text-[#EDF4FF]">
                Morning Insight
              </Text>
              <Text className="mt-2 text-sm leading-6 text-[#A6BDDF]">
                {latestHighlight.summary}
              </Text>
            </AgapCard>
          ) : null}

          <TrendLineChart
            title="Breathing Stability"
            values={breathingTrendValues}
            labels={trendLabels}
            summary="Track how breathing rhythm changes across recent sessions."
            annotation={
              averageTrendBreathing
                ? `Average ${range}: ${averageTrendBreathing.toFixed(1)} rpm`
                : undefined
            }
          />

          <ComparisonBarChart
            title="Recovery Snapshot"
            data={comparisonData}
            summary="Compare breathing control, snore suppression, and overall recovery signal."
          />

          <SleepStagePieChart
            title="Estimated Sleep Stage Mix"
            data={stageData}
            summary="Estimated stage distribution based on your latest respiratory and snore averages."
          />

          <View className="mt-5">
            <AgapButton
              title="View All Sessions"
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "SessionHistory" })
              }
            />
          </View>

          <View className="mt-3">
            <AgapButton
              title="Refresh Dashboard"
              variant="secondary"
              onPress={() => {
                void refreshDashboard();
                void refreshStatus();
              }}
            />
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}
