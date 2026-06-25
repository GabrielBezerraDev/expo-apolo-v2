import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

type NetworkContextValue = {
  hasCheckedNetwork: boolean;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  isOnline: boolean;
};

const initialNetworkState: NetworkContextValue = {
  hasCheckedNetwork: false,
  isConnected: null,
  isInternetReachable: null,
  isOnline: false,
};

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export function NetworkProvider({ children }: PropsWithChildren) {
  const [networkState, setNetworkState] = useState<NetworkContextValue>(initialNetworkState);

  useEffect(() => {
    let active = true;

    const updateNetworkState = (state: NetInfoState) => {
      if (!active) return;

      const nextState = {
        hasCheckedNetwork: true,
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        isOnline: getIsOnline(state),
      };

      onlineManager.setOnline(nextState.isOnline);
      setNetworkState(nextState);
    };

    NetInfo.fetch().then(updateNetworkState).catch(() => {
      if (!active) return;

      onlineManager.setOnline(false);
      setNetworkState({ ...initialNetworkState, hasCheckedNetwork: true });
    });

    const unsubscribe = NetInfo.addEventListener(updateNetworkState);

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => networkState, [networkState]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetworkState() {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error("useNetworkState must be used within a NetworkProvider");
  }

  return context;
}

function getIsOnline(state: NetInfoState) {
  if (state.isConnected === false || state.isInternetReachable === false) return false;

  return state.isConnected === true || state.isInternetReachable === true;
}
