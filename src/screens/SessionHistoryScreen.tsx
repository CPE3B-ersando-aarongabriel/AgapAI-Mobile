import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AgapHeader } from "../components/common/AgapHeader";
import { AgapCard } from "../components/common/AgapCard";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { SessionHistoryCard } from "../components/session/SessionHistoryCard";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SessionHistoryScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScreenContainer scrollable>
      <AgapHeader title="Your Sleep Journey" subtitle="Tracking 14 consecutive nights of restorative rest" />

      <View className="mb-2">
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">October 2025</Text>
      </View>

      <Pressable onPress={() => navigation.navigate("SessionDetail", { sessionId: "session-001" })}>
        <SessionHistoryCard
          date="Last Night"
          title="Quiet & Restorative"
          score={82}
          note="Quiet night with consistent breathing patterns. You entered REM sleep 15% faster than average."
        />
      </Pressable>

      <Pressable onPress={() => navigation.navigate("SessionDetail", { sessionId: "session-002" })}>
        <SessionHistoryCard
          date="Oct 23rd"
          title="Slightly Interrupted"
          score={68}
          note="Elevated room temperature likely caused the 3 AM wake-up. Try cooling the room to 19C tonight."
        />
      </Pressable>

      <AgapCard className="mb-4 bg-[#10264C]">
        <Text className="text-[11px] text-[#8FA6CC]">Weekly Progress</Text>
        <Text className="mt-2 text-sm leading-6 text-[#A6BDDF]">
          You have averaged 7.5 hours of sleep this week. That is 45 minutes more than last week.
        </Text>
        <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#223C67]">
          <View className="h-2 w-4/5 rounded-full bg-[#7DB0FF]" />
        </View>
      </AgapCard>

      <Pressable onPress={() => navigation.navigate("SessionDetail", { sessionId: "session-003" })}>
        <SessionHistoryCard
          date="Oct 22nd"
          title="Optimal Recovery"
          score={91}
          note="This was one of your best nights this month. Your body reached full recovery state by 4:00 AM."
        />
      </Pressable>

      <Pressable onPress={() => navigation.navigate("SessionDetail", { sessionId: "session-004" })}>
        <SessionHistoryCard
          date="Oct 21st"
          title="Stable Heart Rate"
          score={75}
          note="Your cardiovascular metrics remained exceptionally stable during the late-night phase."
        />
      </Pressable>
    </ScreenContainer>
  );
}
