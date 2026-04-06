import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AgapButton } from "../components/common/AgapButton";
import { AgapCard } from "../components/common/AgapCard";
import { AgapHeader } from "../components/common/AgapHeader";
import { ScreenContainer } from "../components/common/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function OptionPill({ label }: { label: string }) {
  return (
    <Pressable className="rounded-full border border-[#365585] bg-[#173361] px-3 py-2">
      <Text className="text-xs text-[#D4E5FF]">{label}</Text>
    </Pressable>
  );
}

export function AdvancedAnalysisInputScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScreenContainer scrollable>
      <AgapHeader showBack title="Deepen Your Analysis" subtitle="Refine your profile for richer recommendations" />

      <AgapCard className="mb-4 overflow-hidden p-0">
        <View className="h-36 w-full bg-[#0E2953]" />
      </AgapCard>

      <AgapCard className="mb-3">
        <Text className="text-sm font-semibold text-[#EAF2FF]">What was your sleeping position last night?</Text>
        <View className="mt-3 flex-row gap-2">
          <OptionPill label="Side" />
          <OptionPill label="Back" />
          <OptionPill label="Stomach" />
        </View>
      </AgapCard>

      <AgapCard className="mb-3">
        <Text className="text-sm font-semibold text-[#EAF2FF]">How consistent is your bedtime?</Text>
        <View className="mt-3 gap-2">
          <OptionPill label="Very Consistent" />
          <OptionPill label="Somewhat Consistent" />
          <OptionPill label="Irregular" />
        </View>
      </AgapCard>

      <AgapCard className="mb-3">
        <Text className="text-sm font-semibold text-[#EAF2FF]">What is your fatigue level today?</Text>
        <View className="mt-3 flex-row justify-between">
          <Text className="text-[11px] uppercase tracking-[1px] text-[#7F98C0]">Full Energy</Text>
          <Text className="text-[11px] uppercase tracking-[1px] text-[#7F98C0]">Very Fatigued</Text>
        </View>
        <View className="mt-2 h-2 rounded-full bg-[#233C66]" />
      </AgapCard>

      <AgapCard className="mb-3">
        <Text className="text-sm font-semibold text-[#EAF2FF]">Any snoring concerns recently?</Text>
        <View className="mt-3 flex-row gap-3">
          <OptionPill label="Yes" />
          <OptionPill label="No" />
          <OptionPill label="Unsure" />
        </View>
      </AgapCard>

      <AgapCard className="mb-6">
        <Text className="text-sm font-semibold text-[#EAF2FF]">Any other habits we should know about?</Text>
        <View className="mt-3 rounded-xl border border-[#2B4267] bg-[#0F2348] p-3">
          <Text className="text-sm text-[#7E96BE]">Late-night tea, meditation, screen time...</Text>
        </View>
      </AgapCard>

      <Text className="mb-4 px-1 text-center text-[11px] leading-5 text-[#7892BC]">
        All data is encrypted and used solely for personalized analysis.
      </Text>

      <AgapButton
        title="Generate Advanced Analysis"
        onPress={() => navigation.navigate("AdvancedAnalysisLoading", { requestId: "placeholder" })}
      />
    </ScreenContainer>
  );
}
