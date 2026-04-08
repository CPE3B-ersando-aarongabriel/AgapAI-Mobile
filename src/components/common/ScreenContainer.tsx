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
      colors={["#050D1E", "#0B1B38", "#163469"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["rgba(127, 160, 222, 0.18)", "rgba(127, 160, 222, 0)"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{
          position: "absolute",
          top: -80,
          right: -40,
          width: 260,
          height: 260,
          borderRadius: 130,
        }}
      />
      <LinearGradient
        colors={["rgba(167, 162, 251, 0.14)", "rgba(167, 162, 251, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          bottom: -110,
          left: -70,
          width: 300,
          height: 300,
          borderRadius: 150,
        }}
      />
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
            className={`${contentClassName}`.trim()}
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
