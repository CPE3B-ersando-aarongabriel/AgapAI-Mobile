import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { SleepTrendBars } from "../components/charts/SleepTrendBars";
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

function estimateScore(avgBreathingRate: number, avgSnoreLevel: number): number {
  return clampScore(100 - avgSnoreLevel * 3 - Math.abs(avgBreathingRate - 14) * 2);
}

export function HomeDashboardScreen() {
  const navigation = useNavigation<Nav>();
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
  const trendValues = dashboard?.trends.map((item) => Math.round(item.avg_breathing_rate)) ?? [];
  const estimatedScore = dashboard
    ? estimateScore(dashboard.average_breathing_rate, dashboard.average_snore_level)
    : null;
  const healthLabel = health?.status === "healthy" ? "Online" : "Check";

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

      {isLoading ? <LoadingState label="Syncing dashboard from backend..." /> : null}

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
                  Snore Avg {formatScore(100 - dashboard.average_snore_level * 4)}
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

          <View className="mt-4">
            <SleepTrendBars
              values={trendValues.length ? trendValues : undefined}
              subtitle="Recent breathing trend from your synced sessions"
            />
          </View>

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
