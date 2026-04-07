/// <reference types="nativewind/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_BASE_URL?: string;
    EXPO_PUBLIC_APP_MODE?: string;
    EXPO_PUBLIC_CHAT_ENDPOINT?: string;
    EXPO_PUBLIC_ADVANCED_ANALYSIS_ENDPOINT?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
