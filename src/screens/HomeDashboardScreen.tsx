import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AgapHeader } from "../components/common/AgapHeader";
import { AgapButton } from "../components/common/AgapButton";
import { AgapCard } from "../components/common/AgapCard";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { SessionMetricTile } from "../components/session/SessionMetricTile";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeDashboardScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScreenContainer scrollable>
      <AgapHeader title="AgapAI" subtitle="Welcome back, sleep hero" />

      <AgapCard className="items-center">
        <View className="h-36 w-36 items-center justify-center rounded-full border-[7px] border-[#5A94EA]">
          <Text className="text-5xl font-semibold text-[#F5F8FF]">85</Text>
          <Text className="mt-1 text-xs uppercase tracking-[1px] text-[#8FA6CC]">Sleep Score</Text>
        </View>
        <View className="mt-3 flex-row gap-2">
          <View className="rounded-full bg-[#193765] px-3 py-1">
            <Text className="text-[11px] text-[#D9E7FF]">8h 12m Duration</Text>
          </View>
          <View className="rounded-full bg-[#193765] px-3 py-1">
            <Text className="text-[11px] text-[#D9E7FF]">92% Efficiency</Text>
          </View>
        </View>
      </AgapCard>

      <AgapCard className="mt-4">
        <Text className="text-base font-semibold text-[#EDF4FF]">Morning Insight</Text>
        <Text className="mt-2 text-sm leading-6 text-[#A6BDDF]">
          Your breathing was exceptionally steady last night. This indicates a deep state of restorative REM sleep.
        </Text>
      </AgapCard>

      <View className="mt-4 flex-row gap-3">
        <SessionMetricTile label="Breathing" value="Consistent" />
      </View>

      <View className="mt-3 flex-row gap-3">
        <SessionMetricTile label="Snoring" value="Rare" helper="2 mins total" />
        <SessionMetricTile label="Quality" value="+12%" helper="vs last week" />
      </View>

      <AgapCard className="mt-4">
        <Text className="text-base font-semibold text-[#EDF4FF]">Nightly Rituals</Text>
        <Text className="mt-2 text-sm leading-6 text-[#A6BDDF]">
          Try to avoid screen time 30 mins before bed for better melatonin production.
        </Text>
      </AgapCard>

      <View className="mt-5">
        <AgapButton
          title="View All Sessions"
          onPress={() => navigation.navigate("MainTabs", { screen: "SessionHistory" })}
        />
      </View>
    </ScreenContainer>
  );
}
