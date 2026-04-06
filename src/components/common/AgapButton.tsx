import { Text, Pressable } from "react-native";

type AgapButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
};

export function AgapButton({
  title,
  onPress,
  variant = "primary",
}: AgapButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      className={`items-center rounded-full px-5 py-3 ${
        isPrimary ? "bg-[#2A72E8]" : "bg-[#1A335D]"
      }`}
    >
      <Text className="text-sm font-semibold text-[#F5F8FF]">{title}</Text>
    </Pressable>
  );
}
