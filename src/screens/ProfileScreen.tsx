import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { AgapButton } from "../components/common/AgapButton";
import { AgapCard } from "../components/common/AgapCard";
import { AgapHeader } from "../components/common/AgapHeader";
import { LoadingState } from "../components/common/LoadingState";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { useServiceStatus } from "../hooks/useServiceStatus";
import type { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store/appStore";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#243E69] py-2.5">
      <Text className="text-xs text-[#95AFD6]">{label}</Text>
      <Text className="max-w-[62%] text-right text-xs font-medium text-[#D8E7FF]">
        {value}
      </Text>
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { appMode, selectedSessionId, sessionDeviceFilter } = useAppStore();
  const { rootInfo, health, isLoading, refresh } = useServiceStatus();

  return (
    <ScreenContainer scrollable>
      <AgapHeader
        title="Profile"
        subtitle="App status, context, and preferences"
        rightLabel="You"
      />

      {isLoading ? <LoadingState label="Loading profile context..." /> : null}

      <AgapCard>
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8FAAD2]">
          Session Context
        </Text>
        <Row
          label="Selected Session"
          value={selectedSessionId ?? "None selected"}
        />
        <Row
          label="Device Filter"
          value={sessionDeviceFilter || "Not set"}
        />
      </AgapCard>

      <AgapCard className="mt-4">
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8FAAD2]">
          Environment
        </Text>
        <Row label="App Mode" value={appMode} />
        <Row
          label="Backend"
          value={rootInfo?.environment ?? "Unknown environment"}
        />
        <Row
          label="Health"
          value={health?.status === "healthy" ? "Healthy" : "Needs check"}
        />
        <View className="mt-4">
          <AgapButton
            title="Refresh Service Status"
            variant="secondary"
            onPress={() => void refresh()}
          />
        </View>
      </AgapCard>

      <AgapCard className="mt-4">
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8FAAD2]">
          Accessibility Defaults
        </Text>
        <Text className="mt-2 text-sm leading-6 text-[#A8C0E5]">
          Buttons maintain larger touch targets, charts use high-contrast colors,
          and content remains readable with dynamic text sizing.
        </Text>
        <View className="mt-4">
          <AgapButton
            title="Open Onboarding Guide"
            variant="secondary"
            onPress={() => navigation.navigate("Onboarding")}
          />
        </View>
      </AgapCard>
    </ScreenContainer>
  );
}
