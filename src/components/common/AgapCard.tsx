import type { PropsWithChildren } from "react";
import { View } from "react-native";

type AgapCardProps = PropsWithChildren<{
  className?: string;
}>;

export function AgapCard({ children, className = "" }: AgapCardProps) {
  return (
    <View
      className={`rounded-card border border-[#294A78] bg-[#102241] p-4 shadow-elevated ${className}`.trim()}
    >
      {children}
    </View>
  );
}
