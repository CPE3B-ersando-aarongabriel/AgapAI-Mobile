import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import {
    type ChartRange,
    RangeSelector,
    TrendLineChart,
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

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
  const healthLabel = health?.status === "healthy" ? "Online" : "Check";

  const filteredTrends = useMemo(() => {
    if (!dashboard?.trends.length) {
      return [];
    }

    const windowSize = range === "day" ? 4 : range === "week" ? 7 : 30;
    return dashboard.trends.slice(-windowSize);
  }, [dashboard?.trends, range]);

  const breathingTrendValues = useMemo(
    () => filteredTrends.map((item) => Number(item.avg_breathing_rate.toFixed(1))),
    [filteredTrends],
  );

  const snoreTrendValues = useMemo(
    () => filteredTrends.map((item) => Number(item.avg_snore_level.toFixed(2))),
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

  return (
    <ScreenContainer scrollable>
      <AgapHeader
        title="AgapAI"
        subtitle={
          rootInfo?.environment
            ? `Backend: ${rootInfo.environment}`
            : "Backend-connected session analytics"
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
          description="Start collecting sessions from your device and dashboard metrics will appear here."
          actionLabel="View Session History"
          onAction={() =>
            navigation.navigate("MainTabs", { screen: "SessionHistory" })
          }
        />
      ) : null}

      {!isLoading && !error && dashboard ? (
        <>
          <AgapCard>
            <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
              Dashboard Totals
            </Text>
            <Text className="mt-2 text-3xl font-semibold text-[#F5F8FF]">
              {dashboard.total_sessions}
            </Text>
            <Text className="mt-1 text-xs text-[#9FB5D6]">
              Total synced sessions
            </Text>
          </AgapCard>

          <View className="mt-4 flex-row gap-3">
            <SummaryTile
              label="Avg Breathing"
              value={`${dashboard.average_breathing_rate.toFixed(1)} rpm`}
            />
            <SummaryTile
              label="Avg Snore"
              value={`${dashboard.average_snore_level.toFixed(2)}`}
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

          <AgapCard className="mt-4">
            <Text className="text-base font-semibold text-[#EDF4FF]">
              Latest Highlights
            </Text>
            {dashboard.latest_highlights.length ? (
              <View className="mt-3 gap-2">
                {dashboard.latest_highlights.slice(0, 3).map((highlight) => (
                  <View
                    key={`${highlight.session_id}-${highlight.updated_at}`}
                    className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3"
                  >
                    <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
                      Session {highlight.session_id}
                    </Text>
                    <Text className="mt-1 text-[11px] text-[#A6BDDF]">
                      Device {highlight.device_id}
                    </Text>
                    <Text className="mt-2 text-sm leading-6 text-[#D8E7FF]">
                      {highlight.summary}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="mt-3 text-sm text-[#9FB5D6]">
                No highlights available from backend yet.
              </Text>
            )}
          </AgapCard>

          <TrendLineChart
            title="Breathing Trend"
            values={breathingTrendValues}
            labels={trendLabels}
            summary="Average breathing rate trend from dashboard payload."
          />

          <TrendLineChart
            title="Snore Trend"
            values={snoreTrendValues}
            labels={trendLabels}
            summary="Average snore level trend from dashboard payload."
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
