import { ActivityIndicator, Text, View } from "react-native";
import { AgapLogo } from "./AgapLogo";
import { SkeletonBlock } from "./SkeletonBlock";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({
  label = "Loading your sleep data...",
}: LoadingStateProps) {
  return (
    <View className="rounded-2xl border border-[#284670] bg-[#11274B] p-4">
      <View className="mb-4 flex-row items-center gap-3">
        <AgapLogo size={30} withBadge />
        <View className="flex-1 gap-2">
          <SkeletonBlock height={11} width="45%" rounded="full" />
          <SkeletonBlock height={10} width="72%" rounded="full" />
        </View>
        <ActivityIndicator size="small" color="#7EA3D9" />
      </View>
      <View className="gap-2.5">
        <SkeletonBlock height={16} rounded="lg" />
        <SkeletonBlock height={16} rounded="lg" width="92%" />
        <SkeletonBlock height={16} rounded="lg" width="84%" />
      </View>
      <Text className="mt-4 text-xs text-[#9BB5D8]">{label}</Text>
    </View>
  );
}
