import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AgapButton } from "../components/common/AgapButton";
import { AgapHeader } from "../components/common/AgapHeader";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { useAdvancedAnalysis } from "../hooks/useAdvancedAnalysis";
import type { RootStackParamList } from "../navigation/types";
import type { AdvancedAnalysisRecord } from "../types/session";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type LoadingRoute = RouteProp<RootStackParamList, "AdvancedAnalysisLoading">;

export function AdvancedAnalysisLoadingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<LoadingRoute>();
  const sessionId = route.params?.sessionId;
  const payload = route.params?.payload;
  const { submit, isSubmitting, error } = useAdvancedAnalysis();
  const [attempt, setAttempt] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<AdvancedAnalysisRecord | null>(null);

  useEffect(() => {
    if (!sessionId || !payload) {
      return;
    }

    let active = true;

    const run = async () => {
      const result = await submit(sessionId, payload);
      if (active && result) {
        setResult(result);
        setIsComplete(true);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [attempt, payload, sessionId, submit]);

  if (!sessionId || !payload) {
    return (
      <ScreenContainer>
        <AgapHeader title="AgapAI" subtitle="Processing advanced analysis" />
        <EmptyState
          title="Analysis request missing"
          description="This screen needs a session and analysis payload. Start from the session detail page."
          actionLabel="Back to History"
          onAction={() =>
            navigation.navigate("MainTabs", { screen: "SessionHistory" })
          }
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AgapHeader title="AgapAI" subtitle="Processing advanced analysis" />

      <View className="flex-1 items-center justify-center">
        <View className="h-44 w-44 items-center justify-center rounded-full border border-[#2C446B] bg-[#0E2348]">
          <ActivityIndicator color="#4A8CFF" size="large" />
        </View>

        <Text className="mt-10 text-3xl font-semibold text-[#F2F7FF]">
          {isComplete
            ? "Advanced Analysis Ready"
            : "Performing Advanced AI Analysis..."}
        </Text>
        <Text className="mt-3 text-center text-sm text-[#A3BADB]">
          {isComplete
            ? "Your latest analysis has been generated and linked to this session."
            : "Waiting for backend advanced analysis response."}
        </Text>

        {error && !isSubmitting && !isComplete ? (
          <View className="mt-6 w-full">
            <ErrorState
              message={error.message}
              onRetry={() => setAttempt((current) => current + 1)}
            />
          </View>
        ) : null}

        {isComplete ? (
          <View className="mt-6 w-full gap-3">
            {result?.detailed_insights?.length ? (
              <View className="rounded-2xl border border-[#2C446B] bg-[#10264B] p-4">
                <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
                  Insight Preview
                </Text>
                {result.detailed_insights.slice(0, 2).map((item) => (
                  <Text key={item} className="mt-2 text-sm text-[#D6E5FF]">
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}

            <AgapButton
              title="View Session Results"
              onPress={() =>
                navigation.replace("SessionDetail", {
                  sessionId,
                })
              }
            />
            <AgapButton
              title="Open Insight Chat"
              variant="secondary"
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "InsightChat" })
              }
            />
          </View>
        ) : null}

        <View className="mt-4">
          <Text className="text-[11px] uppercase tracking-[1px] text-[#7F98C0]">
            Request {route.params?.requestId ?? "N/A"}
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
