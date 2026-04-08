import { View, type DimensionValue } from "react-native";

type SkeletonBlockProps = {
  height?: number;
  width?: DimensionValue;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
};

export function SkeletonBlock({
  height = 14,
  width = "100%",
  rounded = "md",
  className = "",
}: SkeletonBlockProps) {
  const radiusClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
        ? "rounded-xl"
        : rounded === "md"
          ? "rounded-lg"
          : "rounded";

  return (
    <View
      className={`bg-[#17345F] ${radiusClass} ${className}`.trim()}
      style={{ height, width }}
    />
  );
}
