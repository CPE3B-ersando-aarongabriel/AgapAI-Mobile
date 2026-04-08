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
type SessionRange = "recent" | "month" | "all";

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
  const [sessionRange, setSessionRange] = useState<SessionRange>("recent");

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

  const visibleSessions = useMemo(() => {
    if (sessionRange === "all") {
      return sessions;
    }

    const now = new Date();
    const maxAgeDays = sessionRange === "recent" ? 10 : 31;
    return sessions.filter((session) => {
      const diffDays =
        (now.getTime() - session.startedAt.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= maxAgeDays;
    });
  }, [sessionRange, sessions]);

  const renderItem = ({ item }: { item: SessionSummary }) => {
    const isSelected = selectedSessionId === item.sessionId;
    const risk = item.latestPreAnalysis?.risk_level;
    const summaryText =
      item.latestPreAnalysis?.summary ??
      item.latestDeviceResponse?.pre_analysis?.summary ??
      "No summary available yet for this session.";
    const sessionTitle = `Session ${item.sessionId.slice(-8)}`;
    const statusLabel = isSelected
      ? `Selected • ${item.status}`
      : risk
        ? `${item.status} • Risk ${risk}`
        : item.status;

    return (
      <Pressable
        onPress={() => {
          setSelectedSessionId(item.sessionId);
          navigation.navigate("SessionDetail", { sessionId: item.sessionId });
        }}
      >
        <SessionHistoryCard
          date={formatSessionDate(item.startedAt)}
          title={sessionTitle}
          rightLabel={`Samples ${item.sampleCount}`}
          note={summaryText}
          statusLabel={statusLabel}
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
          {visibleSessions.length}/{total}
        </Text>
      </View>

      <View className="mb-3 flex-row gap-2">
        {(
          [
            { value: "recent", label: "10 days" },
            { value: "month", label: "1 month" },
            { value: "all", label: "All" },
          ] as const
        ).map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setSessionRange(option.value)}
            className={`rounded-full border px-3 py-1.5 ${
              sessionRange === option.value
                ? "border-[#6EA4E8] bg-[#2B4E84]"
                : "border-[#32527E] bg-[#14305C]"
            }`}
          >
            <Text className="text-[11px] font-medium text-[#D8E6FF]">
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? <LoadingState label="Fetching session history..." /> : null}

      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={() => void refresh()} />
      ) : null}

      {!isLoading && !error && !visibleSessions.length ? (
        <EmptyState
          title="No sessions available"
          description="Try a valid device id, then refresh. The list now uses device-scoped sessions for better reliability."
          actionLabel="Clear Filter"
          onAction={() => setFilterInput("")}
        />
      ) : null}

      {!isLoading && !error && visibleSessions.length ? (
        <FlatList
          className="flex-1"
          data={visibleSessions}
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
