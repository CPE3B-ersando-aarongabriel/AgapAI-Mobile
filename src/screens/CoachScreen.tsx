import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { ComparisonBarChart } from "../components/charts/InsightCharts";
import { AgapButton } from "../components/common/AgapButton";
import { AgapCard } from "../components/common/AgapCard";
import { AgapHeader } from "../components/common/AgapHeader";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { RecommendationList } from "../components/session/RecommendationList";
import { useDashboard } from "../hooks/useDashboard";
import type { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store/appStore";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function toPercentScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function CoachScreen() {
  const navigation = useNavigation<Nav>();
  const { selectedSessionId } = useAppStore();
  const { dashboard, isLoading, error, refresh } = useDashboard();

  if (isLoading) {
    return (
      <ScreenContainer>
        <AgapHeader
          title="Coach"
          subtitle="Personalized planning for tonight"
          rightLabel="Plan"
        />
        <LoadingState label="Preparing your coaching plan..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <AgapHeader
          title="Coach"
          subtitle="Personalized planning for tonight"
          rightLabel="Plan"
        />
        <ErrorState message={error.message} onRetry={() => void refresh()} />
      </ScreenContainer>
    );
  }

  if (!dashboard) {
    return (
      <ScreenContainer>
        <AgapHeader
          title="Coach"
          subtitle="Personalized planning for tonight"
          rightLabel="Plan"
        />
        <EmptyState
          title="No coaching context yet"
          description="Sync at least one session and your nightly coach plan will appear here."
          actionLabel="Open History"
          onAction={() =>
            navigation.navigate("MainTabs", { screen: "SessionHistory" })
          }
        />
      </ScreenContainer>
    );
  }

  const breathingScore = toPercentScore(
    100 - Math.abs(dashboard.average_breathing_rate - 14) * 6,
  );
  const snoreControlScore = toPercentScore(
    100 - dashboard.average_snore_level * 10,
  );
  const rhythmScore = toPercentScore((dashboard.total_sessions / 10) * 100);
  const suggestedSessionId = selectedSessionId ?? dashboard.latest_highlights[0]?.session_id;

  const topRecommendations = [
    "Begin a 20-minute wind-down without screens before bedtime.",
    "Keep room temperature stable and avoid heavy blankets if snore score drops.",
    "Run one gentle breathing cycle (4-2-6) just before sleep.",
  ];

  return (
    <ScreenContainer scrollable>
      <AgapHeader
        title="Coach"
        subtitle="Personalized planning for tonight"
        rightLabel="Plan"
      />

      <AgapCard>
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8FAAD2]">
          Tonight Focus
        </Text>
        <Text className="mt-2 text-2xl font-semibold text-[#EEF4FF]">
          Build a calmer pre-sleep routine
        </Text>
        <Text className="mt-2 text-sm leading-6 text-[#A8C0E5]">
          Your recent trend suggests the biggest gain will come from consistency
          and environment comfort in the hour before sleep.
        </Text>
      </AgapCard>

      <ComparisonBarChart
        title="Recovery Drivers"
        data={[
          {
            label: "Breath",
            value: breathingScore,
            hint: "Closer to 14 rpm baseline indicates steadier breathing.",
          },
          {
            label: "Snore",
            value: snoreControlScore,
            hint: "Lower snore intensity typically improves sleep continuity.",
          },
          {
            label: "Rhythm",
            value: rhythmScore,
            hint: "Consistent nightly sessions improve coaching accuracy.",
          },
        ]}
        summary="Tap each bar to see what drives the strongest improvement opportunity tonight."
      />

      <View className="mt-4">
        <RecommendationList title="Coach Checklist" items={topRecommendations} />
      </View>

      <View className="mt-4 gap-3">
        <AgapButton
          title="Open Insight Chat"
          onPress={() =>
            navigation.navigate("MainTabs", { screen: "InsightChat" })
          }
        />
        <AgapButton
          title="Run Advanced Analysis"
          variant="secondary"
          onPress={() => {
            if (suggestedSessionId) {
              navigation.navigate("AdvancedAnalysisInput", {
                sessionId: suggestedSessionId,
              });
              return;
            }

            navigation.navigate("MainTabs", { screen: "SessionHistory" });
          }}
        />
      </View>
    </ScreenContainer>
  );
}
