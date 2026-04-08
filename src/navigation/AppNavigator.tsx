import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image } from "react-native";
import { agapaiLogo } from "../assets/logos";
import { AdvancedAnalysisInputScreen } from "../screens/AdvancedAnalysisInputScreen";
import { AdvancedAnalysisLoadingScreen } from "../screens/AdvancedAnalysisLoadingScreen";
import { HomeDashboardScreen } from "../screens/HomeDashboardScreen";
import { InsightChatScreen } from "../screens/InsightChatScreen";
import { SessionDetailScreen } from "../screens/SessionDetailScreen";
import { SessionHistoryScreen } from "../screens/SessionHistoryScreen";
import type { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#041027",
    card: "#0A1B3C",
    text: "#F5F8FF",
    border: "#1D3765",
    primary: "#4A8CFF",
    notification: "#4A8CFF",
  },
};

function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#071633",
          borderTopColor: "#1D3765",
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#4A8CFF",
        tabBarInactiveTintColor: "#6F87B4",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === "HomeDashboard") {
            return (
              <Image
                source={agapaiLogo}
                style={{ width: size + 5, height: size + 5 }}
                resizeMode="contain"
              />
            );
          }

          const iconName =
            route.name === "SessionHistory"
                ? "time-outline"
                : "chatbubble-ellipses-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeDashboard"
        component={HomeDashboardScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="SessionHistory"
        component={SessionHistoryScreen}
        options={{ title: "History" }}
      />
      <Tab.Screen
        name="InsightChat"
        component={InsightChatScreen}
        options={{ title: "Insights" }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#041027" },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
        <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
        <Stack.Screen
          name="AdvancedAnalysisInput"
          component={AdvancedAnalysisInputScreen}
        />
        <Stack.Screen
          name="AdvancedAnalysisLoading"
          component={AdvancedAnalysisLoadingScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
