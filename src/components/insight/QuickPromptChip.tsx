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
      className={`mr-2 min-h-[38px] rounded-full border px-3.5 py-2 ${
        isActive
          ? "border-[#6FA7EE] bg-[#2B4E84]"
          : "border-[#2F4D7D] bg-[#132D58]"
      }`}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text className="text-xs font-medium text-[#D8E6FF]">{label}</Text>
    </Pressable>
  );
}
