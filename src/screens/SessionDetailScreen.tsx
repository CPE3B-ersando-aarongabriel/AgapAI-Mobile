import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AgapButton } from "../components/common/AgapButton";
import { AgapCard } from "../components/common/AgapCard";
import { AgapHeader } from "../components/common/AgapHeader";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { RecommendationBlock } from "../components/session/RecommendationBlock";
import { SessionMetricTile } from "../components/session/SessionMetricTile";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SessionDetailScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScreenContainer scrollable>
      <AgapHeader
        showBack
        title="Restorative Elegance"
        subtitle="Excellent session quality with deep, rhythmic breathing"
      />

      <View className="mb-3 flex-row gap-3">
        <SessionMetricTile label="Breathing" value="14 rpm" />
        <SessionMetricTile label="Snore Level" value="Low" />
      </View>

      <View className="mb-4 flex-row gap-3">
        <SessionMetricTile label="Room Temp" value="68°F" />
        <SessionMetricTile label="Humidity" value="45%" />
      </View>

      <RecommendationBlock
        title="4-7-8 Breathing"
        description="Optimal for neural relaxation and rapid sleep onset."
      />

      <AgapCard className="mt-4">
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8FA6CC]">AI Coach Insights</Text>
        <View className="mt-3 gap-2">
          <View className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3">
            <Text className="text-xs leading-5 text-[#D8E7FF]">
              Your heart rate variability peaked around 3:00 AM, suggesting a highly restorative sleep cycle.
            </Text>
          </View>
          <View className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3">
            <Text className="text-xs leading-5 text-[#D8E7FF]">
              Switching off screens 20 minutes earlier tonight can improve natural melatonin release.
            </Text>
          </View>
        </View>
      </AgapCard>

      <AgapCard className="mt-4">
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8FA6CC]">
          Advanced AI Analysis Results
        </Text>
        <View className="mt-3 gap-2">
          <View className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3">
            <Text className="text-sm font-semibold text-[#EEF5FF]">Deep Neural Mapping Results</Text>
            <Text className="mt-1 text-xs leading-5 text-[#D8E7FF]">
              Your side-sleeping preference combined with partial humidity levels suggests potential airway comfort
              gains with nasal pathway aid kept clear.
            </Text>
          </View>
          <View className="rounded-xl border border-[#2F4C7A] bg-[#172F58] p-3">
            <Text className="text-sm font-semibold text-[#EEF5FF]">Circadian Tuning</Text>
            <Text className="mt-1 text-xs leading-5 text-[#D8E7FF]">
              Response latency around wake-down routine indicates recovery gains by moving wind-down routine 15
              minutes earlier.
            </Text>
          </View>
        </View>
      </AgapCard>

      <View className="mt-5">
        <AgapButton
          title="Advanced AI Analysis"
          onPress={() => navigation.navigate("AdvancedAnalysisInput", { sessionId: "session-placeholder" })}
        />
      </View>
    </ScreenContainer>
  );
}
