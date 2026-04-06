import { View, Text } from "react-native";

const bars = [36, 44, 39, 57, 48, 63];

export function SleepTrendBars() {
  return (
    <View className="rounded-2xl border border-[#2B4267] bg-[#10264C] p-4">
      <Text className="text-[11px] uppercase tracking-[1px] text-[#89A4CB]">
        Sleep Trend Summary
      </Text>
      <View className="mt-3 flex-row items-end justify-between">
        {bars.map((height, index) => (
          <View key={index} className="w-[13%] rounded-t-md bg-[#6B9FEA]" style={{ height }} />
        ))}
      </View>
      <Text className="mt-2 text-xs text-[#9FB5D6]">Consistency is key. Your cadence remains stable.</Text>
    </View>
  );
}
