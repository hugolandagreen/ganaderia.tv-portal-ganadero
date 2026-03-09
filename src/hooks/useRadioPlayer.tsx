import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from "react";

const RADIO_STREAM_URL = "https://vtune.stream/listen/la_pegajosa.net/radio.mp3";

type ActiveMedia = "none" | "radio" | "tv";

interface MediaContextType {
  // Radio
  radioPlaying: boolean;
  radioVolume: number[];
  radioMuted: boolean;
  toggleRadio: () => void;
  setRadioVolume: (v: number[]) => void;
  toggleRadioMute: () => void;
  // TV control
  activeMedia: ActiveMedia;
  requestTVPlay: () => void;
  requestTVStop: () => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioVolume, setRadioVolumeState] = useState([50]);
  const [radioMuted, setRadioMuted] = useState(false);
  const [activeMedia, setActiveMedia] = useState<ActiveMedia>("none");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tvStopCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("error", (e) => {
      console.error("Radio stream error:", e);
      setRadioPlaying(false);
      setActiveMedia((prev) => (prev === "radio" ? "none" : prev));
    });
    audio.addEventListener("playing", () => {
      console.log("Radio stream playing successfully");
    });
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = radioMuted ? 0 : radioVolume[0] / 100;
    }
  }, [radioVolume, radioMuted]);

  const stopRadio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setRadioPlaying(false);
  }, []);

  const toggleRadio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (radioPlaying) {
      stopRadio();
      setActiveMedia("none");
    } else {
      // Stop TV if playing
      if (tvStopCallbackRef.current) {
        tvStopCallbackRef.current();
      }
      audio.src = RADIO_STREAM_URL;
      audio.load();
      audio.play()
        .then(() => {
          setRadioPlaying(true);
          setActiveMedia("radio");
        })
        .catch(console.error);
    }
  }, [radioPlaying, stopRadio]);

  const requestTVPlay = useCallback(() => {
    // Stop radio if playing
    stopRadio();
    setActiveMedia("tv");
  }, [stopRadio]);

  const requestTVStop = useCallback(() => {
    setActiveMedia((prev) => (prev === "tv" ? "none" : prev));
  }, []);

  const setRadioVolume = useCallback((v: number[]) => {
    setRadioVolumeState(v);
    setRadioMuted(false);
  }, []);

  const toggleRadioMute = useCallback(() => {
    setRadioMuted((m) => !m);
  }, []);

  return (
    <MediaContext.Provider
      value={{
        radioPlaying,
        radioVolume,
        radioMuted,
        toggleRadio,
        setRadioVolume,
        toggleRadioMute,
        activeMedia,
        requestTVPlay,
        requestTVStop,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMediaPlayer = () => {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMediaPlayer must be used within MediaProvider");
  return ctx;
};

// Convenience hooks
export const useRadioPlayer = () => {
  const ctx = useMediaPlayer();
  return {
    isPlaying: ctx.radioPlaying,
    volume: ctx.radioVolume,
    isMuted: ctx.radioMuted,
    togglePlay: ctx.toggleRadio,
    setVolume: ctx.setRadioVolume,
    toggleMute: ctx.toggleRadioMute,
  };
};
