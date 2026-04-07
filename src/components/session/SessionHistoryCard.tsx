import { Text, View } from "react-native";
import { AgapCard } from "../common/AgapCard";

type SessionHistoryCardProps = {
  date: string;
  title: string;
  score?: number;
  scoreLabel?: string;
  note: string;
  statusLabel?: string;
};

export function SessionHistoryCard({
  date,
  title,
  score,
  scoreLabel,
  note,
  statusLabel,
}: SessionHistoryCardProps) {
  const finalScoreLabel =
    scoreLabel ?? (typeof score === "number" ? `${score}/100` : "No score");

  return (
    <AgapCard className="mb-4 bg-[#10264C]">
      <Text className="text-[11px] text-[#8FA6CC]">{date}</Text>
      <View className="mt-1 flex-row items-end justify-between">
        <Text className="text-lg font-semibold text-[#F4F8FF]">{title}</Text>
        <Text className="text-xl font-semibold text-[#9EC1FF]">{finalScoreLabel}</Text>
      </View>
      <View className="mt-2 self-start rounded-full bg-[#203A67] px-2 py-1">
        <Text className="text-[10px] uppercase tracking-[0.8px] text-[#B3C8EA]">
          {statusLabel ?? "Session Highlight"}
        </Text>
      </View>
      <Text className="mt-2 text-xs leading-5 text-[#9FB5D6]">{note}</Text>
      <Text className="mt-3 text-[11px] font-semibold uppercase tracking-[1px] text-[#7DA6ED]">
        View Session Details
      </Text>
    </AgapCard>
  );
}
