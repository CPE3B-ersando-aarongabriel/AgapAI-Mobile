import { Text, View } from "react-native";
import { AgapButton } from "./AgapButton";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="rounded-2xl border border-[#5B3458] bg-[#2C1B34] p-4">
      <Text className="text-base font-semibold text-[#F9E9F7]">
        Unable to load data
      </Text>
      <Text className="mt-2 text-sm leading-6 text-[#EBCFE7]">{message}</Text>
      {onRetry ? (
        <View className="mt-4">
          <AgapButton title="Try Again" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}
