import { ActivityIndicator, Text, View } from "react-native";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({
  label = "Loading your sleep data...",
}: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator size="large" color="#4A8CFF" />
      <Text className="mt-4 text-sm text-[#9BB5D8]">{label}</Text>
    </View>
  );
}
