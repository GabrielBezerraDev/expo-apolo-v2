import  {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { AppState } from "react-native";
import {
  preload,
  setAudioModeAsync,
  useAudioPlayer,
  type AudioPlayer,
} from "expo-audio";

const SUCCESS_SOUND = require("@assets/audios/mr_berrydev-single-keypad-beep-433456.mp3");
const ERROR_SOUND = require("@assets/audios/universfield-error-notification-129258.mp3");
const SCAN_SOUND_VOLUME = 0.8;

preloadSound(SUCCESS_SOUND, "success");
preloadSound(ERROR_SOUND, "error");

type InventoryScanAudioContextValue = {
  playError: () => void;
  playSuccess: () => void;
};

const InventoryScanAudioContext = createContext<
  InventoryScanAudioContextValue | undefined
>(undefined);

export function InventoryScanAudioProvider({ children }: PropsWithChildren) {
  const successPlayer = useAudioPlayer(SUCCESS_SOUND);
  const errorPlayer = useAudioPlayer(ERROR_SOUND);
  const appIsActiveRef = useRef(AppState.currentState === "active");
  const playbackRequestRef = useRef(0);

  useEffect(() => {
    try {
      successPlayer.volume = SCAN_SOUND_VOLUME;
      errorPlayer.volume = SCAN_SOUND_VOLUME;
    } catch (error) {
      console.warn("Failed to set inventory scan sound volume.", error);
    }

    void setAudioModeAsync({
      interruptionMode: "mixWithOthers",
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    }).catch(error => {
      console.warn("Failed to configure inventory scan audio.", error);
    });
  }, [errorPlayer, successPlayer]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextState => {
      appIsActiveRef.current = nextState === "active";
      if (appIsActiveRef.current) return;

      playbackRequestRef.current += 1;
      resetPlayer(successPlayer);
      resetPlayer(errorPlayer);
    });

    return () => {
      subscription.remove();
      playbackRequestRef.current += 1;
      resetPlayer(successPlayer);
      resetPlayer(errorPlayer);
    };
  }, [errorPlayer, successPlayer]);

  const replay = useCallback((target: AudioPlayer, opposite: AudioPlayer) => {
    if (!appIsActiveRef.current) return;

    const requestId = playbackRequestRef.current + 1;
    playbackRequestRef.current = requestId;

    let rewind: Promise<void>;
    try {
      opposite.pause();
      target.pause();
      target.volume = SCAN_SOUND_VOLUME;
      rewind = target.seekTo(0);
    } catch (error) {
      console.warn("Failed to prepare an inventory scan sound.", error);
      return;
    }

    void rewind
      .then(() => {
        if (
          !appIsActiveRef.current ||
          playbackRequestRef.current !== requestId
        ) {
          return;
        }

        try {
          target.play();
        } catch (error) {
          console.warn("Failed to play an inventory scan sound.", error);
        }
      })
      .catch(error => {
        console.warn("Failed to rewind an inventory scan sound.", error);
      });
  }, []);

  const playError = useCallback(() => {
    replay(errorPlayer, successPlayer);
  }, [errorPlayer, replay, successPlayer]);

  const playSuccess = useCallback(() => {
    replay(successPlayer, errorPlayer);
  }, [errorPlayer, replay, successPlayer]);

  const value = useMemo(
    () => ({ playError, playSuccess }),
    [playError, playSuccess],
  );

  return (
    <InventoryScanAudioContext.Provider value={value}>
      {children}
    </InventoryScanAudioContext.Provider>
  );
}

export function useInventoryScanAudio() {
  const context = useContext(InventoryScanAudioContext);
  if (!context) {
    throw new Error(
      "useInventoryScanAudio must be used within an InventoryScanAudioProvider",
    );
  }

  return context;
}

function resetPlayer(player: AudioPlayer) {
  try {
    player.pause();
    void player.seekTo(0).catch(() => undefined);
  } catch {
    // Audio feedback must never interrupt inventory state transitions.
  }
}

function preloadSound(source: number, name: string) {
  try {
    void preload(source)?.catch(error => {
      console.warn(`Failed to preload the inventory ${name} sound.`, error);
    });
  } catch (error) {
    console.warn(`Failed to preload the inventory ${name} sound.`, error);
  }
}
