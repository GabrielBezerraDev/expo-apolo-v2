import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

export type AppHeaderConfig = {
  onBack?: () => void;
  onMenu?: () => void;
  showBack?: boolean;
  showMenu?: boolean;
  subtitle?: string;
  title: string;
  visible?: boolean;
};

type AppHeaderState = Required<Pick<AppHeaderConfig, "showBack" | "showMenu" | "title" | "visible">> & {
  onBack?: () => void;
  onMenu?: () => void;
  subtitle?: string;
};

type AppHeaderContextValue = {
  headerConfig: AppHeaderState;
  setHeaderConfig: (config: AppHeaderConfig) => void;
};

const defaultHeaderConfig: AppHeaderState = {
  showBack: false,
  showMenu: true,
  subtitle: "Olá, Operador X",
  title: "Valorlog",
  visible: true,
};

const AppHeaderContext = createContext<AppHeaderContextValue | undefined>(undefined);

export function AppHeaderProvider({ children }: PropsWithChildren) {
  const [headerConfig, setHeaderConfigState] = useState<AppHeaderState>(defaultHeaderConfig);

  const setHeaderConfig = useCallback((config: AppHeaderConfig) => {
    setHeaderConfigState({
      ...defaultHeaderConfig,
      ...config,
      visible: config.visible ?? true,
      showBack: config.showBack ?? false,
      showMenu: config.showMenu ?? true,
    });
  }, []);

  const value = useMemo(
    () => ({ headerConfig, setHeaderConfig }),
    [headerConfig, setHeaderConfig],
  );

  return <AppHeaderContext.Provider value={value}>{children}</AppHeaderContext.Provider>;
}

export function useAppHeaderContext() {
  const context = useContext(AppHeaderContext);

  if (!context) {
    throw new Error("useAppHeaderContext must be used within an AppHeaderProvider");
  }

  return context;
}

export function useAppHeaderConfig(config: AppHeaderConfig) {
  const { setHeaderConfig } = useAppHeaderContext();

  useFocusEffect(
    useCallback(() => {
      setHeaderConfig(config);
    }, [
      config.onBack,
      config.onMenu,
      config.showBack,
      config.showMenu,
      config.subtitle,
      config.title,
      config.visible,
      setHeaderConfig,
    ]),
  );
}
