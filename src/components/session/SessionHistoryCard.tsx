import { Text, View } from "react-native";
import { AgapCard } from "../common/AgapCard";

type SessionHistoryCardProps = {
  date: string;
  title: string;
  rightLabel?: string;
  note: string;
  statusLabel?: string;
};

export function SessionHistoryCard({
  date,
  title,
  rightLabel,
  note,
  statusLabel,
}: SessionHistoryCardProps) {
  return (
    <AgapCard className="mb-4 bg-[#10284D]">
      <Text className="text-[11px] text-[#90ABD2]">{date}</Text>
      <View className="mt-1 flex-row items-end justify-between">
        <Text className="text-lg font-semibold text-[#F4F8FF]">{title}</Text>
        {rightLabel ? (
          <Text className="text-sm font-semibold text-[#9EC1FF]">
            {rightLabel}
          </Text>
        ) : null}
      </View>
      <View className="mt-3 self-start rounded-full bg-[#1F3B69] px-2.5 py-1.5">
        <Text className="text-[10px] uppercase tracking-[0.8px] text-[#B3C8EA]">
          {statusLabel ?? "Session Highlight"}
        </Text>
      </View>
      <Text className="mt-3 text-xs leading-5 text-[#A7BEDF]">{note}</Text>
      <Text className="mt-4 text-[11px] font-semibold uppercase tracking-[1px] text-[#7DA6ED]">
        View Session Details
      </Text>
    </AgapCard>
  );
}
