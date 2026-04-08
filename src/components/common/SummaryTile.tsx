import { Text, View } from "react-native";

type SummaryTileProps = {
  label: string;
  value: string;
  helper?: string;
};

export function SummaryTile({ label, value, helper }: SummaryTileProps) {
  return (
    <View className="flex-1 rounded-panel border border-[#2D4D7A] bg-[#10284D] p-4">
      <Text className="text-[10px] uppercase tracking-[1.1px] text-[#8FAED6]">
        {label}
      </Text>
      <Text className="mt-2 text-[28px] font-semibold text-[#F2F7FF]">
        {value}
      </Text>
      {helper ? (
        <Text className="mt-1 text-xs leading-5 text-[#9FB5D6]">{helper}</Text>
      ) : null}
    </View>
  );
}
