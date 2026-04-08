import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppStoreProvider } from "./src/store/appStore";
import "./src/theme/global.css";

export default function App() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!loaded) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-[#081A3A]">
          <ActivityIndicator size="large" color="#7EA3D9" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppStoreProvider>
        <AppNavigator />
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
