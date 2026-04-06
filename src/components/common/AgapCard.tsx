import type { PropsWithChildren } from "react";
import { View } from "react-native";

type AgapCardProps = PropsWithChildren<{
  className?: string;
}>;

export function AgapCard({ children, className = "" }: AgapCardProps) {
  return (
    <View
      className={`rounded-card border border-[#2C446B] bg-[#11264A] p-4 shadow-card ${className}`.trim()}
    >
      {children}
    </View>
  );
}
