import { Text, View } from "react-native";

type RecommendationBlockProps = {
  title: string;
  description: string;
};

export function RecommendationBlock({
  title,
  description,
}: RecommendationBlockProps) {
  return (
    <View className="rounded-2xl border border-[#315080] bg-[#122C56] p-4">
      <Text className="text-xs uppercase tracking-[1px] text-[#8EA8CF]">
        Recommended Rhythm
      </Text>
      <Text className="mt-2 text-2xl font-semibold text-[#F5F8FF]">
        {title}
      </Text>
      <Text className="mt-1 text-xs leading-5 text-[#A8BDDC]">
        {description}
      </Text>
    </View>
  );
}
