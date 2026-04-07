import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type AppMode = "development" | "staging" | "production";

export type AppStoreState = {
  selectedSessionId: string | null;
  sessionDeviceFilter: string;
  appMode: AppMode;
};

export type AppStoreActions = {
  setSelectedSessionId: (sessionId: string | null) => void;
  setSessionDeviceFilter: (deviceId: string) => void;
};

export type AppStoreValue = AppStoreState & AppStoreActions;

const initialAppMode =
  (process.env.EXPO_PUBLIC_APP_MODE as AppMode | undefined) ?? "development";

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [selectedSessionId, setSelectedSessionIdState] = useState<string | null>(
    null,
  );
  const [sessionDeviceFilter, setSessionDeviceFilterState] = useState("");

  const setSelectedSessionId = useCallback((sessionId: string | null) => {
    setSelectedSessionIdState(sessionId);
  }, []);

  const setSessionDeviceFilter = useCallback((deviceId: string) => {
    setSessionDeviceFilterState(deviceId);
  }, []);

  const value = useMemo<AppStoreValue>(
    () => ({
      selectedSessionId,
      sessionDeviceFilter,
      appMode: initialAppMode,
      setSelectedSessionId,
      setSessionDeviceFilter,
    }),
    [selectedSessionId, sessionDeviceFilter, setSelectedSessionId, setSessionDeviceFilter],
  );

  const ContextProvider = AppStoreContext.Provider;
  return createElement(ContextProvider, { value }, children);
}

export function useAppStore(): AppStoreValue {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used inside AppStoreProvider");
  }

  return context;
}
