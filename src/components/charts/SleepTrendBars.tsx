import { Text, View } from "react-native";

type SleepTrendBarsProps = {
  values?: number[];
  subtitle?: string;
};

const defaultValues = [36, 44, 39, 57, 48, 63];

export function SleepTrendBars({
  values = defaultValues,
  subtitle = "Consistency is key. Your cadence remains stable.",
}: SleepTrendBarsProps) {
  const maxValue = Math.max(...values, 1);

  return (
    <View className="rounded-2xl border border-[#2B4267] bg-[#10264C] p-4">
      <Text className="text-[11px] uppercase tracking-[1px] text-[#89A4CB]">
        Sleep Trend Summary
      </Text>
      <View className="mt-3 flex-row items-end justify-between">
        {values.map((value, index) => (
          <View
            key={index}
            className="w-[13%] rounded-t-md bg-[#6B9FEA]"
            style={{ height: Math.max(12, (value / maxValue) * 64) }}
          />
        ))}
      </View>
      <Text className="mt-2 text-xs text-[#9FB5D6]">{subtitle}</Text>
    </View>
  );
}
