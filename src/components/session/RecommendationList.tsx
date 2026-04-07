import { Text, View } from "react-native";

type RecommendationListProps = {
  title?: string;
  items: string[];
  emptyMessage?: string;
};

export function RecommendationList({
  title = "Recommendations",
  items,
  emptyMessage = "No recommendations were returned for this section.",
}: RecommendationListProps) {
  return (
    <View className="rounded-2xl border border-[#2B4267] bg-[#10264C] p-4">
      <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
        {title}
      </Text>
      {items.length ? (
        <View className="mt-2 gap-2">
          {items.map((item) => (
            <Text key={item} className="text-sm leading-6 text-[#D8E7FF]">
              • {item}
            </Text>
          ))}
        </View>
      ) : (
        <Text className="mt-2 text-sm text-[#9FB5D6]">{emptyMessage}</Text>
      )}
    </View>
  );
}
