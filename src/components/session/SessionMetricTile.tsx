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
    <View className="flex-1 rounded-panel border border-[#2C4B78] bg-[#10264A] p-3.5">
      <Text className="text-[10px] uppercase tracking-[1px] text-[#84A3CE]">
        {label}
      </Text>
      <Text className="mt-2 text-[22px] font-semibold text-[#EFF5FF]">
        {value}
      </Text>
      {helper ? (
        <Text className="mt-1 text-[11px] text-[#8EA8CF]">{helper}</Text>
      ) : null}
    </View>
  );
}
