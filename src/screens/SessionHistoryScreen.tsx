import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { AgapButton } from "../components/common/AgapButton";
import { AgapHeader } from "../components/common/AgapHeader";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { SessionHistoryCard } from "../components/session/SessionHistoryCard";
import { useSessionHistory } from "../hooks/useSessionHistory";
import type { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store/appStore";
import type { SessionSummary } from "../types/session";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function estimateSessionScore(session: SessionSummary): number | undefined {
  const metrics = session.summaryMetrics;
  if (!metrics) {
    return undefined;
  }

  const breathingRate = Number(metrics.average_breathing_rate ?? 14);
  const snoreLevel = Number(metrics.average_snore_level ?? 0);
  const snorePenalty = Math.min(45, snoreLevel * 4);
  const breathingPenalty = Math.min(25, Math.abs(breathingRate - 14) * 2);
  const riskPenalty =
    session.latestPreAnalysis?.risk_level === "high"
      ? 15
      : session.latestPreAnalysis?.risk_level === "medium"
        ? 7
        : 0;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - snorePenalty - breathingPenalty - riskPenalty),
    ),
  );
}

function formatSessionDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return "Last Night";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTitleByRiskLevel(riskLevel: string | null | undefined): string {
  const level = (riskLevel ?? "").toLowerCase();
  if (level === "low") {
    return "Quiet & Restorative";
  }
  if (level === "high") {
    return "Needs Attention";
  }
  return "Slightly Interrupted";
}

export function SessionHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const {
    selectedSessionId,
    sessionDeviceFilter,
    setSelectedSessionId,
    setSessionDeviceFilter,
  } = useAppStore();
  const {
    sessions,
    total,
    setDeviceFilter,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useSessionHistory({ pageSize: 8, defaultDeviceId: sessionDeviceFilter });
  const [filterInput, setFilterInput] = useState(sessionDeviceFilter);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeviceFilter(filterInput);
      setSessionDeviceFilter(filterInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [filterInput, setDeviceFilter, setSessionDeviceFilter]);

  const monthLabel = useMemo(() => {
    if (!sessions.length) {
      return "No sessions yet";
    }

    return sessions[0].startedAt.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [sessions]);

  const renderItem = ({ item }: { item: SessionSummary }) => {
    const score = estimateSessionScore(item);
    const isSelected = selectedSessionId === item.sessionId;

    return (
      <Pressable
        onPress={() => {
          setSelectedSessionId(item.sessionId);
          navigation.navigate("SessionDetail", { sessionId: item.sessionId });
        }}
      >
        <SessionHistoryCard
          date={formatSessionDate(item.startedAt)}
          title={getTitleByRiskLevel(item.latestPreAnalysis?.risk_level)}
          score={score}
          note={
            item.latestPreAnalysis?.summary ||
            "No pre-analysis summary was generated for this session yet."
          }
          statusLabel={
            isSelected
              ? `Selected • ${item.latestPreAnalysis?.risk_level ?? "recorded"}`
              : (item.latestPreAnalysis?.risk_level ?? "Recorded")
          }
        />
      </Pressable>
    );
  };

  return (
    <ScreenContainer>
      <AgapHeader
        title="Your Sleep Journey"
        subtitle={`Tracking ${total} synced sessions`}
      />

      <View className="mb-3 rounded-2xl border border-[#2B4267] bg-[#10264C] px-3 py-2">
        <Text className="mb-1 text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
          Filter by Device ID
        </Text>
        <TextInput
          value={filterInput}
          onChangeText={setFilterInput}
          placeholder="Type a device id"
          placeholderTextColor="#6F87B4"
          autoCapitalize="none"
          autoCorrect={false}
          className="rounded-xl border border-[#2F4D7D] bg-[#0E2348] px-3 py-2 text-sm text-[#E5EFFF]"
        />
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
          {monthLabel}
        </Text>
        <Text className="text-[11px] uppercase tracking-[1px] text-[#8EA8CF]">
          {sessions.length}/{total}
        </Text>
      </View>

      {isLoading ? <LoadingState label="Fetching session history..." /> : null}

      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={() => void refresh()} />
      ) : null}

      {!isLoading && !error && !sessions.length ? (
        <EmptyState
          title="No sessions available"
          description="Try a valid device id, then refresh. The list now uses device-scoped sessions for better reliability."
          actionLabel="Clear Filter"
          onAction={() => setFilterInput("")}
        />
      ) : null}

      {!isLoading && !error && sessions.length ? (
        <FlatList
          className="flex-1"
          data={sessions}
          keyExtractor={(item) => item.sessionId}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void refresh()}
              tintColor="#7FB0FF"
            />
          }
          onEndReachedThreshold={0.35}
          onEndReached={() => {
            void loadMore();
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            hasMore ? (
              <View className="pb-4 pt-2">
                {isLoadingMore ? (
                  <ActivityIndicator color="#7FB0FF" />
                ) : (
                  <AgapButton
                    title="Load More Sessions"
                    variant="secondary"
                    onPress={() => void loadMore()}
                  />
                )}
              </View>
            ) : null
          }
        />
      ) : null}
    </ScreenContainer>
  );
}
