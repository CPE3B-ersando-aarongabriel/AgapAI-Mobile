import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AgapButton } from "../components/common/AgapButton";
import { AgapCard } from "../components/common/AgapCard";
import { AgapHeader } from "../components/common/AgapHeader";
import { AgapLogo } from "../components/common/AgapLogo";
import { EmptyState } from "../components/common/EmptyState";
import { ScreenContainer } from "../components/common/ScreenContainer";
import type { RootStackParamList } from "../navigation/types";
import type {
  AdvancedAnalysisInputValues,
  FocusAreaOption,
} from "../types/analysis";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type InputRoute = RouteProp<RootStackParamList, "AdvancedAnalysisInput">;

function OptionPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-3 py-2 ${
        active
          ? "border-[#5F9DFF] bg-[#214883]"
          : "border-[#365585] bg-[#173361]"
      }`}
    >
      <Text className="text-xs text-[#D4E5FF]">{label}</Text>
    </Pressable>
  );
}

const focusAreaOptions: { value: FocusAreaOption; label: string }[] = [
  { value: "breathing", label: "Breathing" },
  { value: "snoring", label: "Snoring" },
  { value: "sleep_posture", label: "Posture" },
  { value: "room_comfort", label: "Room Comfort" },
  { value: "fatigue", label: "Fatigue" },
  { value: "bedtime_consistency", label: "Bedtime Rhythm" },
];

function toggleFocusArea(current: FocusAreaOption[], area: FocusAreaOption) {
  return current.includes(area)
    ? current.filter((item) => item !== area)
    : [...current, area];
}

export function AdvancedAnalysisInputScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<InputRoute>();
  const sessionId = route.params?.sessionId;
  const [values, setValues] = useState<AdvancedAnalysisInputValues>({
    focusAreas: ["breathing", "bedtime_consistency"],
    breathingConcern: false,
    snoringConcern: false,
    sleepPosture: "side",
    roomComfort: "comfortable",
    fatigueLevel: "moderate",
    notes: "",
  });

  if (!sessionId) {
    return (
      <ScreenContainer>
        <AgapHeader
          showBack
          onBackPress={() => navigation.goBack()}
          title="Deepen Your Analysis"
          subtitle="No session selected"
        />
        <EmptyState
          title="Session missing"
          description="Open this flow from a session detail screen to generate advanced analysis."
          actionLabel="Go to History"
          onAction={() =>
            navigation.navigate("MainTabs", { screen: "SessionHistory" })
          }
        />
      </ScreenContainer>
    );
  }

  const selectedFocusAreas = new Set(values.focusAreas);
  if (values.breathingConcern) {
    selectedFocusAreas.add("breathing");
  }
  if (values.snoringConcern) {
    selectedFocusAreas.add("snoring");
  }
  if (values.sleepPosture !== "unsure") {
    selectedFocusAreas.add("sleep_posture");
  }
  if (values.roomComfort !== "comfortable") {
    selectedFocusAreas.add("room_comfort");
  }
  if (values.fatigueLevel === "fatigued") {
    selectedFocusAreas.add("fatigue");
  }

  const payload = {
    focus_areas: Array.from(selectedFocusAreas),
    include_environmental_context: values.roomComfort !== "comfortable",
    include_behavioral_suggestions: true,
  };

  return (
    <ScreenContainer scrollable>
      <AgapHeader
        showBack
        onBackPress={() => navigation.goBack()}
        title="Deepen Your Analysis"
        subtitle="Refine your profile for richer recommendations"
      />

      <AgapCard className="mb-4 overflow-hidden p-0">
        <View className="h-36 w-full items-center justify-center bg-[#0E2953]">
          <AgapLogo size={132} />
        </View>
      </AgapCard>

      <AgapCard className="mb-3">
        <Text className="text-sm font-semibold text-[#EAF2FF]">
          Which areas should AI focus on?
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {focusAreaOptions.map((option) => (
            <OptionPill
              key={option.value}
              label={option.label}
              active={values.focusAreas.includes(option.value)}
              onPress={() =>
                setValues((current) => ({
                  ...current,
                  focusAreas: toggleFocusArea(current.focusAreas, option.value),
                }))
              }
            />
          ))}
        </View>
      </AgapCard>

      <AgapCard className="mb-3">
        <Text className="text-sm font-semibold text-[#EAF2FF]">
          What was your sleeping position last night?
        </Text>
        <View className="mt-3 flex-row gap-2">
          {[
            { value: "side", label: "Side" },
            { value: "back", label: "Back" },
            { value: "stomach", label: "Stomach" },
            { value: "unsure", label: "Unsure" },
          ].map((option) => (
            <OptionPill
              key={option.value}
              label={option.label}
              active={values.sleepPosture === option.value}
              onPress={() =>
                setValues((current) => ({
                  ...current,
                  sleepPosture:
                    option.value as AdvancedAnalysisInputValues["sleepPosture"],
                }))
              }
            />
          ))}
        </View>
      </AgapCard>

      <AgapCard className="mb-3">
        <Text className="text-sm font-semibold text-[#EAF2FF]">
          How does your room comfort feel?
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {[
            { value: "comfortable", label: "Comfortable" },
            { value: "too_warm", label: "Too Warm" },
            { value: "too_cold", label: "Too Cold" },
            { value: "humid", label: "Humid" },
            { value: "dry", label: "Dry" },
          ].map((option) => (
            <OptionPill
              key={option.value}
              label={option.label}
              active={values.roomComfort === option.value}
              onPress={() =>
                setValues((current) => ({
                  ...current,
                  roomComfort:
                    option.value as AdvancedAnalysisInputValues["roomComfort"],
                }))
              }
            />
          ))}
        </View>
      </AgapCard>

      <AgapCard className="mb-3">
        <Text className="text-sm font-semibold text-[#EAF2FF]">
          What is your fatigue level today?
        </Text>
        <View className="mt-3 flex-row gap-2">
          {[
            { value: "full_energy", label: "Full Energy" },
            { value: "moderate", label: "Moderate" },
            { value: "fatigued", label: "Fatigued" },
          ].map((option) => (
            <OptionPill
              key={option.value}
              label={option.label}
              active={values.fatigueLevel === option.value}
              onPress={() =>
                setValues((current) => ({
                  ...current,
                  fatigueLevel:
                    option.value as AdvancedAnalysisInputValues["fatigueLevel"],
                }))
              }
            />
          ))}
        </View>
      </AgapCard>

      <AgapCard className="mb-6">
        <Text className="text-sm font-semibold text-[#EAF2FF]">
          Any concerns you want to prioritize?
        </Text>
        <View className="mt-3 flex-row gap-2">
          <OptionPill
            label="Breathing Concern"
            active={values.breathingConcern}
            onPress={() =>
              setValues((current) => ({
                ...current,
                breathingConcern: !current.breathingConcern,
              }))
            }
          />
          <OptionPill
            label="Snoring Concern"
            active={values.snoringConcern}
            onPress={() =>
              setValues((current) => ({
                ...current,
                snoringConcern: !current.snoringConcern,
              }))
            }
          />
        </View>
        <View className="mt-3 rounded-xl border border-[#2B4267] bg-[#0F2348] p-1">
          <TextInput
            value={values.notes}
            onChangeText={(notes) =>
              setValues((current) => ({
                ...current,
                notes,
              }))
            }
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder="Late-night tea, meditation, screen time..."
            placeholderTextColor="#7E96BE"
            className="min-h-[84px] px-2 py-2 text-sm text-[#EAF2FF]"
          />
        </View>
      </AgapCard>

      <Text className="mb-4 px-1 text-center text-[11px] leading-5 text-[#7892BC]">
        All data is encrypted and used solely for personalized analysis.
      </Text>

      <AgapButton
        title="Generate Advanced Analysis"
        onPress={() =>
          navigation.navigate("AdvancedAnalysisLoading", {
            requestId: `${Date.now()}`,
            sessionId,
            payload,
          })
        }
      />
    </ScreenContainer>
  );
}
