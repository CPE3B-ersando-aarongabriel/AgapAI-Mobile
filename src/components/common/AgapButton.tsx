import { ActivityIndicator, Pressable, Text } from "react-native";

type AgapButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  isLoading?: boolean;
};

export function AgapButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  isLoading = false,
}: AgapButtonProps) {
  const isPrimary = variant === "primary";
  const isDisabled = disabled || isLoading;
  const buttonClassName = [
    "items-center rounded-full px-5 py-3",
    isPrimary ? "bg-[#2A72E8]" : "bg-[#1A335D]",
    isDisabled ? "opacity-60" : "opacity-100",
  ].join(" ");

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={buttonClassName}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#F5F8FF" />
      ) : (
        <Text className="text-sm font-semibold text-[#F5F8FF]">{title}</Text>
      )}
    </Pressable>
  );
}
