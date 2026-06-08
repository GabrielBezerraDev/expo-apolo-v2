import React from "react";
import { Text } from "tamagui";
import { useModal } from "../Modal";

export interface AppCardFooterConfig {
  title: string;
  footerCallback: (...rest: any[]) => any;
}

type UseAppCardParams = {
  footerConfig?: AppCardFooterConfig;
};

export function useAppCard({ footerConfig }: UseAppCardParams) {
  const { openModal } = useModal();

  const defaultFooterConfig: AppCardFooterConfig = {
    title: "OPÇÕES",
    footerCallback: () => {
      openModal(<Text>Teste</Text>);
    },
  };

  const resolvedFooterConfig = footerConfig ?? defaultFooterConfig;

  return {
    footerCallback: resolvedFooterConfig.footerCallback,
    footerTitle: resolvedFooterConfig.title,
  };
}
