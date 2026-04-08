import { Text, View } from "react-native";

type SynthesisProgressCardProps = {
  title: string;
  progressLabel: string;
  progressValue: string;
};

export function SynthesisProgressCard({
  title,
  progressLabel,
  progressValue,
}: SynthesisProgressCardProps) {
  const parsedProgress = Number(progressValue.replace("%", ""));
  const normalizedProgress = Number.isFinite(parsedProgress)
    ? Math.max(4, Math.min(100, parsedProgress))
    : 0;

  return (
    <View className="w-full rounded-2xl border border-[#2C446B] bg-[#10264B] p-4">
      <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
        Live Synthesis
      </Text>
      <Text className="mt-2 text-base font-semibold text-[#EDF4FF]">
        {title}
      </Text>
      <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#223C67]">
        <View
          className="h-2 rounded-full bg-[#7EA3D9]"
          style={{ width: `${normalizedProgress}%` }}
        />
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-[#9DB4D8]">{progressLabel}</Text>
        <Text className="text-xs font-semibold text-[#CFE1FF]">
          {progressValue}
        </Text>
      </View>
    </View>
  );
}
