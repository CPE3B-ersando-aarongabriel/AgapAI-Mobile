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
import type { SessionRecord } from "../types/session";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getLastSensorEvent(session: SessionRecord) {
  return session.sensor_events.length
    ? session.sensor_events[session.sensor_events.length - 1]
    : null;
}

function estimateSessionScore(session: SessionRecord): number | undefined {
  const lastEvent = getLastSensorEvent(session);
  if (!lastEvent) {
    return undefined;
  }

  const snorePenalty = Math.min(45, lastEvent.snore_level * 4);
  const breathingPenalty = Math.min(
    25,
    Math.abs(lastEvent.breathing_rate - 14) * 2,
  );
  const riskPenalty =
    session.latest_pre_analysis?.risk_level === "high"
      ? 15
      : session.latest_pre_analysis?.risk_level === "medium"
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

function formatSessionDate(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

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
    sessions,
    total,
    setDeviceFilter,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useSessionHistory({ pageSize: 8 });
  const [filterInput, setFilterInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeviceFilter(filterInput);
    }, 350);

    return () => clearTimeout(timer);
  }, [filterInput, setDeviceFilter]);

  const monthLabel = useMemo(() => {
    if (!sessions.length) {
      return "No sessions yet";
    }

    return new Date(sessions[0].started_at).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [sessions]);

  const renderItem = ({ item }: { item: SessionRecord }) => {
    const score = estimateSessionScore(item);

    return (
      <Pressable
        onPress={() => {
          navigation.navigate("SessionDetail", { sessionId: item.session_id });
        }}
      >
        <SessionHistoryCard
          date={formatSessionDate(item.started_at)}
          title={getTitleByRiskLevel(item.latest_pre_analysis?.risk_level)}
          score={score}
          note={
            item.latest_pre_analysis?.summary ||
            "No pre-analysis summary was generated for this session yet."
          }
          statusLabel={item.latest_pre_analysis?.risk_level ?? "Recorded"}
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
          description="Try a different device filter or wait for your next synced sleep session."
          actionLabel="Clear Filter"
          onAction={() => setFilterInput("")}
        />
      ) : null}

      {!isLoading && !error && sessions.length ? (
        <FlatList
          className="flex-1"
          data={sessions}
          keyExtractor={(item) => item.session_id}
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
