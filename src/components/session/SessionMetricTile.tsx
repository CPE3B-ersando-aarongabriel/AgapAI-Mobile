import { Text, View } from "react-native";

type SessionMetricTileProps = {
  label: string;
  value: string;
  helper?: string;
};

export function SessionMetricTile({
  label,
  value,
  helper,
}: SessionMetricTileProps) {
  return (
    <View className="flex-1 rounded-2xl border border-[#2B4267] bg-[#0F2348] p-3">
      <Text className="text-[10px] uppercase tracking-[1px] text-[#7D96BE]">
        {label}
      </Text>
      <Text className="mt-1 text-xl font-semibold text-[#EFF5FF]">{value}</Text>
      {helper ? (
        <Text className="mt-1 text-[11px] text-[#8EA8CF]">{helper}</Text>
      ) : null}
    </View>
  );
}
