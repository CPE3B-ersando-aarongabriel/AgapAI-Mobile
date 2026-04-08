import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenContainerProps = PropsWithChildren<{
  scrollable?: boolean;
  contentClassName?: string;
}>;

export function ScreenContainer({
  children,
  scrollable = false,
  contentClassName = "",
}: ScreenContainerProps) {
  return (
    <LinearGradient
      colors={["#041027", "#081A3A", "#0F2D63"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            className={`px-5 ${contentClassName}`.trim()}
          >
            {children}
          </ScrollView>
        ) : (
          <View className={`flex-1 px-5 ${contentClassName}`.trim()}>
            {children}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
