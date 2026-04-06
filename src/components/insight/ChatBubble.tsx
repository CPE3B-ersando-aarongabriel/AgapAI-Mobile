import { Text, View } from "react-native";

type ChatBubbleProps = {
  role: "assistant" | "user";
  message: string;
};

export function ChatBubble({ role, message }: ChatBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <View
      className={`mb-3 max-w-[90%] rounded-2xl px-4 py-3 ${
        isAssistant
          ? "self-start border border-[#2C446B] bg-[#10264B]"
          : "self-end bg-[#2A72E8]"
      }`}
    >
      <Text className={`text-sm leading-6 ${isAssistant ? "text-[#E1ECFF]" : "text-white"}`}>
        {message}
      </Text>
    </View>
  );
}
