import { ScrollView, Text, View } from "react-native";
import { AgapHeader } from "../components/common/AgapHeader";
import { AgapCard } from "../components/common/AgapCard";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { SleepTrendBars } from "../components/charts/SleepTrendBars";
import { ChatBubble } from "../components/insight/ChatBubble";
import { QuickPromptChip } from "../components/insight/QuickPromptChip";

export function InsightChatScreen() {
  return (
    <ScreenContainer>
      <AgapHeader title="AgapAI" subtitle="Live coaching session" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-semibold text-[#EFF6FF]">Morning Reflection</Text>
        <Text className="mt-2 text-sm leading-6 text-[#A9C0E2]">
          Analyzing your circadian rhythm and deep sleep efficiency.
        </Text>

        <View className="mt-5">
          <ChatBubble
            role="assistant"
            message="Good morning. Looking at your data from the last 7 days, your Deep Sleep Phase improved by 4.2%, with 15% higher consistency than your baseline."
          />
        </View>

        <View className="mb-4 mt-1">
          <SleepTrendBars />
        </View>

        <ChatBubble
          role="user"
          message="That is great to hear. Can you give me one tip to stay on this track tonight?"
        />

        <View className="mb-3 mt-2 flex-row">
          <QuickPromptChip label="Analyze last night" />
          <QuickPromptChip label="Tips for deep sleep" />
          <QuickPromptChip label="Compare sessions" />
        </View>

        <AgapCard className="rounded-full px-4 py-3">
          <Text className="text-sm text-[#7F98C0]">Ask your sleep coach...</Text>
        </AgapCard>
      </ScrollView>
    </ScreenContainer>
  );
}
