import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { AgapCard } from "../common/AgapCard";

export type ChartRange = "day" | "week" | "month";

type RangeSelectorProps = {
  value: ChartRange;
  onChange: (value: ChartRange) => void;
};

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  const options: ChartRange[] = ["day", "week", "month"];

  return (
    <View className="flex-row rounded-full border border-[#27436E] bg-[#102548] p-1">
      {options.map((option) => {
        const isActive = value === option;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={`Show ${option} range`}
            onPress={() => onChange(option)}
            className={`rounded-full px-4 py-2 ${
              isActive ? "bg-[#365E9B]" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-medium uppercase ${
                isActive ? "text-[#EAF2FF]" : "text-[#96B0D7]"
              }`}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type TrendLineChartProps = {
  title: string;
  values: number[];
  labels: string[];
  xValues?: number[];
  summary: string;
  annotation?: string;
};

export function TrendLineChart({
  title,
  values,
  labels,
  xValues,
  summary,
  annotation,
}: TrendLineChartProps) {
  const [activeIndex, setActiveIndex] = useState(values.length - 1);
  const max = Math.max(...values, 1);

  useEffect(() => {
    setActiveIndex(values.length > 0 ? values.length - 1 : 0);
  }, [values]);

  const points = useMemo(() => {
    if (!values.length) {
      return [] as { x: number; y: number; value: number; label: string }[];
    }

    const hasTimeAxis =
      Array.isArray(xValues) &&
      xValues.length === values.length &&
      xValues.every((value) => Number.isFinite(value));

    const minX = hasTimeAxis ? Math.min(...xValues) : 0;
    const maxX = hasTimeAxis ? Math.max(...xValues) : 1;
    const xRange = Math.max(maxX - minX, 1);

    return values.map((value, index) => {
      const xPosition = hasTimeAxis
        ? ((xValues[index] - minX) / xRange) * 230
        : (index / Math.max(values.length - 1, 1)) * 230;
      const x = 10 + xPosition;
      const y = 90 - (value / max) * 72;
      return { x, y, value, label: labels[index] ?? `${index + 1}` };
    });
  }, [labels, max, values, xValues]);

  const activePoint = points[activeIndex] ?? null;
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <AgapCard className="mt-4">
      <Text className="text-base font-semibold text-[#EEF4FF]">{title}</Text>
      <View className="mt-4 rounded-2xl border border-[#27436E] bg-[#0D1F3F]">
        <Svg width={250} height={110}>
          <Path d="M 8 16 L 242 16" stroke="#294976" strokeWidth={1} />
          <Path d="M 8 92 L 242 92" stroke="#294976" strokeWidth={1} />
          {linePath ? (
            <Path d={linePath} stroke="#7EA3D9" strokeWidth={2.5} fill="none" />
          ) : null}
          {points.map((point, index) => (
            <Circle
              key={`${point.label}-${index}`}
              cx={point.x}
              cy={point.y}
              r={index === activeIndex ? 5.6 : 4.2}
              fill={index === activeIndex ? "#D7E8FF" : "#7EA3D9"}
              stroke="#1E3C6E"
              strokeWidth={2}
              onPress={() => setActiveIndex(index)}
            />
          ))}
        </Svg>
      </View>
      {activePoint ? (
        <View className="mt-3 rounded-2xl border border-[#27436E] bg-[#10294F] px-3 py-2">
          <Text className="text-xs font-semibold text-[#CFE1FF]">
            {activePoint.label}: {activePoint.value.toFixed(1)}
          </Text>
        </View>
      ) : null}
      {annotation ? (
        <Text className="mt-2 text-xs text-[#A8C0E5]">{annotation}</Text>
      ) : null}
      <Text className="mt-2 text-sm text-[#A8C0E5]">{summary}</Text>
    </AgapCard>
  );
}

type ComparisonDatum = {
  label: string;
  value: number;
  hint?: string;
};

type ComparisonBarChartProps = {
  title: string;
  data: ComparisonDatum[];
  summary: string;
};

export function ComparisonBarChart({
  title,
  data,
  summary,
}: ComparisonBarChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const max = Math.max(...data.map((item) => item.value), 1);
  const active = data[activeIndex] ?? null;

  return (
    <AgapCard className="mt-4">
      <Text className="text-base font-semibold text-[#EEF4FF]">{title}</Text>
      <View className="mt-4 flex-row items-end justify-between gap-2 rounded-2xl border border-[#27436E] bg-[#0D1F3F] px-3 py-4">
        {data.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={`${item.label}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} ${item.value.toFixed(1)}`}
              onPress={() => setActiveIndex(index)}
              className="flex-1 items-center"
            >
              <View
                className={`w-5 rounded-t-2xl ${
                  isActive ? "bg-[#7EA3D9]" : "bg-[#3C5F94]"
                }`}
                style={{ height: Math.max(14, (item.value / max) * 86) }}
              />
              <Text className="mt-2 text-[10px] uppercase text-[#8FAAD2]">
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {active ? (
        <View className="mt-3 rounded-2xl border border-[#27436E] bg-[#10294F] px-3 py-2">
          <Text className="text-xs font-semibold text-[#CFE1FF]">
            {active.label}: {active.value.toFixed(1)}
          </Text>
          {active.hint ? (
            <Text className="mt-1 text-xs text-[#9EB8DE]">{active.hint}</Text>
          ) : null}
        </View>
      ) : null}
      <Text className="mt-2 text-sm text-[#A8C0E5]">{summary}</Text>
    </AgapCard>
  );
}

type PieDatum = {
  label: string;
  value: number;
  color: string;
};

type SleepStagePieChartProps = {
  title: string;
  data: PieDatum[];
  summary: string;
};

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export function SleepStagePieChart({
  title,
  data,
  summary,
}: SleepStagePieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = Math.max(
    data.reduce((sum, item) => sum + item.value, 0),
    1,
  );

  let start = 0;
  const slices = data.map((item) => {
    const angle = (item.value / total) * 360;
    const slice = {
      ...item,
      start,
      end: start + angle,
      percent: Math.round((item.value / total) * 100),
    };
    start += angle;
    return slice;
  });

  const active = slices[activeIndex] ?? null;

  return (
    <AgapCard className="mt-4">
      <Text className="text-base font-semibold text-[#EEF4FF]">{title}</Text>
      <View className="mt-4 flex-row items-center justify-between gap-3">
        <View className="items-center justify-center">
          <Svg width={150} height={150}>
            <G>
              {slices.map((slice, index) => (
                <Path
                  key={`${slice.label}-${index}`}
                  d={describeArc(75, 75, 62, slice.start, slice.end)}
                  fill={slice.color}
                  opacity={index === activeIndex ? 1 : 0.8}
                  onPress={() => setActiveIndex(index)}
                />
              ))}
              <Circle cx={75} cy={75} r={33} fill="#0F2348" />
            </G>
          </Svg>
          {active ? (
            <Text className="-mt-20 text-sm font-semibold text-[#EAF2FF]">
              {active.percent}%
            </Text>
          ) : null}
        </View>
        <View className="flex-1 gap-2">
          {slices.map((slice, index) => (
            <Pressable
              key={`legend-${slice.label}-${index}`}
              onPress={() => setActiveIndex(index)}
              className={`rounded-xl border px-2.5 py-2 ${
                index === activeIndex
                  ? "border-[#4E75B0] bg-[#173561]"
                  : "border-[#27436E] bg-[#10294F]"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <Text className="text-xs font-medium text-[#D7E7FF]">
                    {slice.label}
                  </Text>
                </View>
                <Text className="text-xs text-[#A8C0E5]">{slice.percent}%</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      <Text className="mt-2 text-sm text-[#A8C0E5]">{summary}</Text>
    </AgapCard>
  );
}

type StackedDatum = {
  label: string;
  light: number;
  deep: number;
  rem: number;
};

type SleepStageStackedChartProps = {
  title: string;
  data: StackedDatum[];
  summary: string;
};

export function SleepStageStackedChart({
  title,
  data,
  summary,
}: SleepStageStackedChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = data[activeIndex] ?? null;

  return (
    <AgapCard className="mt-4">
      <Text className="text-base font-semibold text-[#EEF4FF]">{title}</Text>
      <View className="mt-4 flex-row items-end justify-between gap-2 rounded-2xl border border-[#27436E] bg-[#0D1F3F] px-3 py-4">
        {data.map((item, index) => {
          const total = Math.max(item.light + item.deep + item.rem, 1);
          const lightHeight = Math.max(8, (item.light / total) * 74);
          const deepHeight = Math.max(8, (item.deep / total) * 74);
          const remHeight = Math.max(8, (item.rem / total) * 74);

          return (
            <Pressable
              key={`${item.label}-${index}`}
              onPress={() => setActiveIndex(index)}
              className="flex-1 items-center"
            >
              <View
                className={`w-7 overflow-hidden rounded-2xl border ${
                  index === activeIndex
                    ? "border-[#8DB2E6]"
                    : "border-[#2E4A77]"
                }`}
              >
                <View style={{ height: remHeight }} className="bg-[#8B86F4]" />
                <View style={{ height: deepHeight }} className="bg-[#4B79BF]" />
                <View
                  style={{ height: lightHeight }}
                  className="bg-[#A7C6ED]"
                />
              </View>
              <Text className="mt-2 text-[10px] uppercase text-[#8FAAD2]">
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mt-2 flex-row gap-3">
        <LegendDot color="#A7C6ED" label="Light" />
        <LegendDot color="#4B79BF" label="Deep" />
        <LegendDot color="#8B86F4" label="REM" />
      </View>
      {active ? (
        <View className="mt-3 rounded-2xl border border-[#27436E] bg-[#10294F] px-3 py-2">
          <Text className="text-xs font-semibold text-[#CFE1FF]">
            {active.label}
          </Text>
          <Text className="mt-1 text-xs text-[#9EB8DE]">
            Light {active.light.toFixed(1)}h • Deep {active.deep.toFixed(1)}h •
            REM {active.rem.toFixed(1)}h
          </Text>
        </View>
      ) : null}
      <Text className="mt-2 text-sm text-[#A8C0E5]">{summary}</Text>
    </AgapCard>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <View
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text className="text-[11px] text-[#9FB5D6]">{label}</Text>
    </View>
  );
}
