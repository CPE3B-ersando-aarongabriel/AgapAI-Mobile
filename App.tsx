import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppStoreProvider } from "./src/store/appStore";
import "./src/theme/global.css";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppStoreProvider>
        <AppNavigator />
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
