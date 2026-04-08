import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AgapButton } from "../components/common/AgapButton";
import { AgapCard } from "../components/common/AgapCard";
import { AgapHeader } from "../components/common/AgapHeader";
import { ScreenContainer } from "../components/common/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type StepItem = {
  id: string;
  title: string;
  detail: string;
};

const steps: StepItem[] = [
  {
    id: "device",
    title: "Connect Device",
    detail: "Ensure your ESP32 session source is powered and on the same network.",
  },
  {
    id: "session",
    title: "Capture First Session",
    detail: "Record one full night so AgapAI can establish your baseline pattern.",
  },
  {
    id: "review",
    title: "Review Dashboard",
    detail: "Check breathing stability and snore trends in the Home and Coach tabs.",
  },
  {
    id: "coach",
    title: "Follow Coach Plan",
    detail: "Apply one recommendation tonight and compare your next score.",
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);

  const completion = useMemo(
    () => Math.round((completedStepIds.length / steps.length) * 100),
    [completedStepIds.length],
  );

  const toggleStep = (id: string) => {
    setCompletedStepIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <ScreenContainer scrollable>
      <AgapHeader
        showBack
        onBackPress={() => navigation.goBack()}
        title="Getting Started"
        subtitle="A quick setup flow for first-week success"
        rightLabel={`${completion}%`}
      />

      <AgapCard>
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8FAAD2]">
          Onboarding Progress
        </Text>
        <Text className="mt-2 text-2xl font-semibold text-[#EEF4FF]">
          {completion}% complete
        </Text>
        <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#213B67]">
          <View
            className="h-2 rounded-full bg-[#7EA3D9]"
            style={{ width: `${Math.max(4, completion)}%` }}
          />
        </View>
      </AgapCard>

      <View className="mt-4 gap-3">
        {steps.map((step, index) => {
          const complete = completedStepIds.includes(step.id);
          return (
            <Pressable
              key={step.id}
              onPress={() => toggleStep(step.id)}
              className={`rounded-2xl border p-4 ${
                complete
                  ? "border-[#6EA4E8] bg-[#214375]"
                  : "border-[#2D4D7A] bg-[#10284D]"
              }`}
              accessibilityRole="button"
              accessibilityLabel={`${complete ? "Completed" : "Pending"} step ${index + 1}: ${step.title}`}
            >
              <Text className="text-[11px] uppercase tracking-[1px] text-[#9CB6DE]">
                Step {index + 1}
              </Text>
              <Text className="mt-1 text-base font-semibold text-[#EEF4FF]">
                {step.title}
              </Text>
              <Text className="mt-2 text-sm leading-6 text-[#A8C0E5]">
                {step.detail}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-5 gap-3">
        <AgapButton
          title="Open Session History"
          onPress={() =>
            navigation.navigate("MainTabs", { screen: "SessionHistory" })
          }
        />
        <AgapButton
          title="Go To Coach"
          variant="secondary"
          onPress={() => navigation.navigate("MainTabs", { screen: "Coach" })}
        />
      </View>
    </ScreenContainer>
  );
}
