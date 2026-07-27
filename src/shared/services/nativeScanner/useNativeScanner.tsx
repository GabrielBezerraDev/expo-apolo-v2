// zebra-scanner.ts

import {
  NativeEventEmitter,
  NativeModules,
  Platform,
} from "react-native";

export type ZebraScanResult = {
  data: string;
  labelType: string | null;
  source: string | null;
};

type ZebraScannerNativeModule = {
  addListener(eventName: string): void;
  removeListeners(count: number): void;
};

const nativeModule =
  NativeModules.ZebraScanner as
    | ZebraScannerNativeModule
    | undefined;

function getNativeModule(): ZebraScannerNativeModule {
  if (Platform.OS !== "android") {
    throw new Error(
      "The Zebra scanner is only available on Android.",
    );
  }

  if (!nativeModule) {
    throw new Error(
      "ZebraScanner native module was not found. Rebuild the Android app.",
    );
  }

  return nativeModule;
}

export function addZebraScanListener(
  listener: (result: ZebraScanResult) => void,
) {
  const module = getNativeModule();
  const emitter = new NativeEventEmitter(module);

  return emitter.addListener(
    "onBarcodeScanned",
    listener,
  );
}