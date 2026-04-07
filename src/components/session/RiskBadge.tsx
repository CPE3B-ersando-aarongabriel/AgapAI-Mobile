import { Text, View } from "react-native";

type RiskBadgeProps = {
  level: string;
};

const levelStyles: Record<string, { bg: string; text: string }> = {
  low: { bg: "bg-[#173B2F]", text: "text-[#8CF0BD]" },
  medium: { bg: "bg-[#4D3B17]", text: "text-[#FFD37E]" },
  high: { bg: "bg-[#4D1F28]", text: "text-[#FF9AA9]" },
};

export function RiskBadge({ level }: RiskBadgeProps) {
  const normalized = level.toLowerCase();
  const style = levelStyles[normalized] ?? levelStyles.medium;

  return (
    <View className={`self-start rounded-full px-3 py-1 ${style.bg}`}>
      <Text
        className={`text-[11px] font-semibold uppercase tracking-[1px] ${style.text}`}
      >
        {normalized} risk
      </Text>
    </View>
  );
}
