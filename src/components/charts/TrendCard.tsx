import { Text, View } from "react-native";

type TrendCardProps = {
  title: string;
  value: string;
  helper?: string;
};

export function TrendCard({ title, value, helper }: TrendCardProps) {
  return (
    <View className="rounded-2xl border border-[#2B4267] bg-[#10264C] p-4">
      <Text className="text-[11px] uppercase tracking-[1px] text-[#89A4CB]">{title}</Text>
      <Text className="mt-2 text-2xl font-semibold text-[#F2F7FF]">{value}</Text>
      {helper ? <Text className="mt-1 text-xs text-[#9FB5D6]">{helper}</Text> : null}
    </View>
  );
}
