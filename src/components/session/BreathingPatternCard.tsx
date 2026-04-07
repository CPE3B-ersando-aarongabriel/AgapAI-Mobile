import { Text, View } from "react-native";
import type { BreathingPattern } from "../../types/session";

type BreathingPatternCardProps = {
  pattern: BreathingPattern | null;
};

export function BreathingPatternCard({ pattern }: BreathingPatternCardProps) {
  if (!pattern) {
    return (
      <View className="rounded-2xl border border-[#2B4267] bg-[#0F2348] p-4">
        <Text className="text-sm text-[#9FB5D6]">
          Breathing guidance is not available for this session yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-2xl border border-[#315080] bg-[#122C56] p-4">
      <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
        Recommended Rhythm
      </Text>
      <Text className="mt-2 text-xl font-semibold text-[#F5F8FF]">
        {pattern.label}
      </Text>
      <Text className="mt-2 text-xs leading-6 text-[#B7CDED]">
        Inhale {pattern.inhale_seconds}s, hold {pattern.hold_seconds}s, exhale{" "}
        {pattern.exhale_seconds}s for {pattern.cycles} cycles.
      </Text>
    </View>
  );
}
