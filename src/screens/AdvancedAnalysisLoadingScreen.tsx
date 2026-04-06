import { ActivityIndicator, Text, View } from "react-native";
import { AgapHeader } from "../components/common/AgapHeader";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { SynthesisProgressCard } from "../components/loading/SynthesisProgressCard";

export function AdvancedAnalysisLoadingScreen() {
  return (
    <ScreenContainer>
      <AgapHeader title="AgapAI" subtitle="Processing advanced analysis" />

      <View className="flex-1 items-center justify-center">
        <View className="h-44 w-44 items-center justify-center rounded-full border border-[#2C446B] bg-[#0E2348]">
          <ActivityIndicator color="#4A8CFF" size="large" />
        </View>

        <Text className="mt-10 text-3xl font-semibold text-[#F2F7FF]">Performing Advanced AI Analysis...</Text>
        <Text className="mt-3 text-center text-sm text-[#A3BADB]">
          Synthesizing session data and your profile inputs.
        </Text>

        <View className="mt-7 w-full">
          <SynthesisProgressCard
            title="Circadian Alignment"
            progressLabel="REM Optimization"
            progressValue="84%"
          />
        </View>

        <View className="mt-6 rounded-full border border-[#2C446B] bg-[#10264B] px-5 py-3">
          <Text className="text-center text-xs text-[#AFC4E4]">
            Did you know? Consistent wake times improve rest quality by 40%.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
