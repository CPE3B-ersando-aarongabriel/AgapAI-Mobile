import { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  View,
} from "react-native";

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
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      friction: 7,
      tension: 160,
      useNativeDriver: true,
    }).start();
  };

  const buttonClassName = [
    "items-center justify-center rounded-full px-5",
    isPrimary ? "bg-[#3B67A5]" : "bg-[#182E55]",
    isDisabled ? "opacity-60" : "opacity-100",
  ].join(" ");

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => animateTo(0.98)}
        onPressOut={() => animateTo(1)}
        className={buttonClassName}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={{ minHeight: 52 }}
      >
        {isPrimary ? (
          <View
            pointerEvents="none"
            className="absolute inset-0 rounded-full border border-[#5F88C8]"
          />
        ) : null}
        {isLoading ? (
          <ActivityIndicator size="small" color="#F5F8FF" />
        ) : (
          <Text className="text-sm font-semibold text-[#F5F8FF]">{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
