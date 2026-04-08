import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import {
  type ChartRange,
  RangeSelector,
  TrendLineChart,
} from "../components/charts/InsightCharts";
import { AgapButton } from "../components/common/AgapButton";
import { AgapCard } from "../components/common/AgapCard";
import { AgapHeader } from "../components/common/AgapHeader";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { ChatBubble } from "../components/insight/ChatBubble";
import { QuickPromptChip } from "../components/insight/QuickPromptChip";
import { useDashboard } from "../hooks/useDashboard";
import { useInsights } from "../hooks/useInsights";

export function InsightChatScreen() {
  const {
    messages,
    isStreaming,
    isLoadingContext,
    error,
    selectedSessionId,
    selectedDeviceId,
    suggestions,
    sendMessage,
    resetChat,
  } = useInsights();
  const { dashboard } = useDashboard();
  const [draft, setDraft] = useState("");
  const [trendRange, setTrendRange] = useState<ChartRange>("week");
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(
    null,
  );
  const messageScrollRef = useRef<ScrollView | null>(null);

  const filteredTrends = useMemo(() => {
    if (!dashboard?.trends.length) {
      return [];
    }

    const windowSize =
      trendRange === "day" ? 4 : trendRange === "week" ? 7 : 30;
    return dashboard.trends.slice(-windowSize);
  }, [dashboard?.trends, trendRange]);

  const trendValues = useMemo(
    () =>
      filteredTrends.map((item) => Number(item.avg_breathing_rate.toFixed(1))),
    [filteredTrends],
  );
  const trendLabels = useMemo(
    () =>
      filteredTrends.map((item) =>
        new Date(item.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      ),
    [filteredTrends],
  );

  useEffect(() => {
    messageScrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || isStreaming) {
      return;
    }

    setDraft("");
    await sendMessage(text);
    setActiveSuggestionId(null);
  }, [draft, isStreaming, sendMessage]);

  const handleSuggestionPress = useCallback(
    async (suggestionId: string, prompt: string) => {
      if (isStreaming) {
        return;
      }
      setActiveSuggestionId(suggestionId);
      await sendMessage(prompt);
      setActiveSuggestionId(null);
    },
    [isStreaming, sendMessage],
  );

  return (
    <ScreenContainer>
      <AgapHeader
        title="AgapAI"
        subtitle={
          selectedSessionId
            ? `Live coaching for ${selectedSessionId}`
            : selectedDeviceId
              ? `Device context: ${selectedDeviceId}`
              : "Live coaching session"
        }
      />

      {isLoadingContext ? (
        <LoadingState label="Preparing your chat context..." />
      ) : null}

      {!isLoadingContext && !selectedSessionId ? (
        <EmptyState
          title="No session context"
          description="Record at least one session to unlock personalized insight chat."
        />
      ) : null}

      <ScrollView
        ref={messageScrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-semibold text-[#EFF6FF]">
          Morning Reflection
        </Text>
        <Text className="mt-2 text-sm leading-6 text-[#A9C0E2]">
          Ask follow-up questions to get deeper recommendations from your latest
          session.
        </Text>

        {error ? <ErrorState message={error.message} /> : null}

        <View className="mt-5">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              role={message.role}
              message={message.content}
              createdAt={message.createdAt}
              sections={message.sections}
              isError={message.isError}
            />
          ))}
        </View>

        <View className="mb-2 mt-1">
          <AgapCard>
            <Text className="text-[11px] uppercase tracking-[1px] text-[#8FAAD2]">
              Coaching Trend Window
            </Text>
            <View className="mt-3 self-start">
              <RangeSelector value={trendRange} onChange={setTrendRange} />
            </View>
          </AgapCard>
        </View>

        <TrendLineChart
          title="Contextual Breathing Trend"
          values={trendValues}
          labels={trendLabels}
          summary="This trend is used by the coach to ground responses in recent patterns."
        />

        <ScrollView
          horizontal
          className="mb-3 mt-2"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {suggestions.map((suggestion) => (
            <QuickPromptChip
              key={suggestion.id}
              label={suggestion.label}
              isActive={activeSuggestionId === suggestion.id}
              onPress={() =>
                void handleSuggestionPress(suggestion.id, suggestion.prompt)
              }
            />
          ))}
        </ScrollView>

        <AgapCard className="mb-2 rounded-2xl px-3 py-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask your sleep coach..."
            placeholderTextColor="#7F98C0"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            className="min-h-[52px] text-sm text-[#DCEBFF]"
          />
        </AgapCard>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <AgapButton
              title={isStreaming ? "Thinking..." : "Send"}
              isLoading={isStreaming}
              disabled={!draft.trim()}
              onPress={() => void handleSend()}
            />
          </View>
          <View className="flex-1">
            <AgapButton
              title="Clear"
              variant="secondary"
              disabled={isStreaming}
              onPress={resetChat}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
