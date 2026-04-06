export type AppStoreState = {
  selectedSessionId: string | null;
  appMode: "development" | "staging" | "production";
};

export const initialAppStoreState: AppStoreState = {
  selectedSessionId: null,
  appMode: "development",
};
