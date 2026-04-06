import { Pressable, Text } from "react-native";

type QuickPromptChipProps = {
  label: string;
  onPress?: () => void;
};

export function QuickPromptChip({ label, onPress }: QuickPromptChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-2 rounded-full border border-[#2F4D7D] bg-[#122C56] px-3 py-2"
    >
      <Text className="text-xs text-[#D8E6FF]">{label}</Text>
    </Pressable>
  );
}
