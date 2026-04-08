import { Text, View } from "react-native";

type ChatBubbleProps = {
  role: "assistant" | "user";
  message: string;
  createdAt?: string;
  sections?: {
    title: string;
    items: string[];
  }[];
  isError?: boolean;
};

export function ChatBubble({
  role,
  message,
  createdAt,
  sections,
  isError = false,
}: ChatBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <View
      className={`mb-3 max-w-[92%] rounded-[18px] px-4 py-3.5 ${
        isAssistant
          ? `self-start border border-[#2C4B78] ${isError ? "bg-[#3A1C2F]" : "bg-[#10284D]"}`
          : "self-end bg-[#31558F]"
      }`}
    >
      <Text
        className={`text-sm leading-6 ${isAssistant ? "text-[#E1ECFF]" : "text-white"}`}
      >
        {message}
      </Text>

      {sections?.length ? (
        <View className="mt-3 gap-2">
          {sections.map((section) => (
            <View
              key={section.title}
              className="rounded-xl border border-[#2C4B78] bg-[#0F2348] p-3"
            >
              <Text className="text-[11px] uppercase tracking-[1px] text-[#88A6D3]">
                {section.title}
              </Text>
              {section.items.map((item) => (
                <Text
                  key={item}
                  className="mt-2 text-xs leading-5 text-[#D6E5FF]"
                >
                  • {item}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {createdAt ? (
        <Text
          className={`mt-2 text-[10px] ${isAssistant ? "text-[#8FAAD2]" : "text-[#D4E5FF]"}`}
        >
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      ) : null}
    </View>
  );
}
