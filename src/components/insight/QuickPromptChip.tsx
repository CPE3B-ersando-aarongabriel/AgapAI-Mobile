import { Pressable, Text } from "react-native";

type QuickPromptChipProps = {
  label: string;
  onPress?: () => void;
  isActive?: boolean;
};

export function QuickPromptChip({
  label,
  onPress,
  isActive = false,
}: QuickPromptChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 rounded-full border px-3 py-2 ${
        isActive
          ? "border-[#5F9DFF] bg-[#214883]"
          : "border-[#2F4D7D] bg-[#122C56]"
      }`}
    >
      <Text className="text-xs text-[#D8E6FF]">{label}</Text>
    </Pressable>
  );
}
