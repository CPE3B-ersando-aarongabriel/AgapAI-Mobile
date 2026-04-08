import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image } from "react-native";
import { agapaiLogo } from "../assets/logos";
import { AdvancedAnalysisInputScreen } from "../screens/AdvancedAnalysisInputScreen";
import { AdvancedAnalysisLoadingScreen } from "../screens/AdvancedAnalysisLoadingScreen";
import { CoachScreen } from "../screens/CoachScreen";
import { HomeDashboardScreen } from "../screens/HomeDashboardScreen";
import { InsightChatScreen } from "../screens/InsightChatScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
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
          backgroundColor: "#071836",
          borderTopColor: "#1D3765",
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#8CB1E8",
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
              : route.name === "InsightChat"
                ? "chatbubble-ellipses-outline"
                : route.name === "Coach"
                  ? "sparkles-outline"
                  : "person-circle-outline";

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
      <Tab.Screen
        name="Coach"
        component={CoachScreen}
        options={{ title: "Coach" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
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
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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
