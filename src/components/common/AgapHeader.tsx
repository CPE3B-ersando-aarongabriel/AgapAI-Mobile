import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type AgapHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export function AgapHeader({ title, subtitle, showBack = false }: AgapHeaderProps) {
  return (
    <View className="mb-6 mt-1 flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        {showBack ? <Ionicons name="chevron-back" size={18} color="#B8C8E8" /> : null}
        <View>
          <Text className="text-lg font-semibold text-moon">{title}</Text>
          {subtitle ? <Text className="text-xs text-[#8FA6CC]">{subtitle}</Text> : null}
        </View>
      </View>
      <View className="h-9 w-9 items-center justify-center rounded-full border border-[#2C446B] bg-[#0E2449]">
        <Text className="text-xs font-semibold text-[#C8DAFF]">AI</Text>
      </View>
    </View>
  );
}
