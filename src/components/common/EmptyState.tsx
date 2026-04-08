import { Text, View } from "react-native";
import { AgapButton } from "./AgapButton";
import { AgapLogo } from "./AgapLogo";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center rounded-2xl border border-[#2C446B] bg-[#0F2348] p-5">
      <AgapLogo size={44} withBadge />
      <Text className="text-lg font-semibold text-[#EDF4FF]">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-6 text-[#9FB5D6]">
        {description}
      </Text>
      {actionLabel && onAction ? (
        <View className="mt-4 w-full">
          <AgapButton
            title={actionLabel}
            onPress={onAction}
            variant="secondary"
          />
        </View>
      ) : null}
    </View>
  );
}
