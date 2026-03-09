import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from "react";
import Hls from "hls.js";

const RADIO_STREAM_URL = "https://vtune.stream/listen/la_pegajosa.net/radio.mp3";
const TV_STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

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
  // Global TV player
  tvPlaying: boolean;
  tvStarted: boolean;
  tvVolume: number[];
  tvMuted: boolean;
  tvVideoRef: React.RefObject<HTMLVideoElement | null>;
  tvHlsRef: React.RefObject<Hls | null>;
  toggleTVPlay: () => void;
  setTVVolume: (v: number[]) => void;
  toggleTVMute: () => void;
  tvPipActive: boolean;
  setTvPipActive: (v: boolean) => void;
  tvPipDismissed: boolean;
  setTvPipDismissed: (v: boolean) => void;
  isTVSectionVisible: boolean;
  setIsTVSectionVisible: (v: boolean) => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  // Radio state
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioVolume, setRadioVolumeState] = useState([50]);
  const [radioMuted, setRadioMuted] = useState(false);
  const [activeMedia, setActiveMedia] = useState<ActiveMedia>("none");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TV state
  const [tvPlaying, setTVPlaying] = useState(false);
  const [tvStarted, setTVStarted] = useState(false);
  const [tvVolume, setTVVolumeState] = useState([50]);
  const [tvMuted, setTVMuted] = useState(false);
  const [tvPipActive, setTvPipActive] = useState(false);
  const [tvPipDismissed, setTvPipDismissed] = useState(false);
  const [isTVSectionVisible, setIsTVSectionVisible] = useState(true);
  const tvVideoRef = useRef<HTMLVideoElement | null>(null);
  const tvHlsRef = useRef<Hls | null>(null);

  // Initialize radio audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("error", (e) => {
      console.error("Radio stream error:", e);
      setRadioPlaying(false);
      setActiveMedia((prev) => (prev === "radio" ? "none" : prev));
    });
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  // Radio volume effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = radioMuted ? 0 : radioVolume[0] / 100;
    }
  }, [radioVolume, radioMuted]);

  // TV volume effect
  useEffect(() => {
    if (tvVideoRef.current) {
      tvVideoRef.current.volume = tvMuted ? 0 : tvVolume[0] / 100;
      tvVideoRef.current.muted = tvMuted;
    }
  }, [tvVolume, tvMuted]);

  // Stop radio
  const stopRadio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setRadioPlaying(false);
  }, []);

  // Toggle radio
  const toggleRadio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (radioPlaying) {
      stopRadio();
      setActiveMedia("none");
    } else {
      // Stop TV if playing
      if (tvVideoRef.current && tvPlaying) {
        tvVideoRef.current.pause();
        setTVPlaying(false);
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
  }, [radioPlaying, stopRadio, tvPlaying]);

  // TV play/pause
  const toggleTVPlay = useCallback(() => {
    const video = tvVideoRef.current;
    if (!video) return;

    if (!tvStarted) {
      // Stop radio if playing
      stopRadio();
      setActiveMedia("tv");
      
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(TV_STREAM_URL);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(console.error);
        });
        tvHlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = TV_STREAM_URL;
        video.play().catch(console.error);
      }
      setTVStarted(true);
      setTVPlaying(true);
    } else {
      if (tvPlaying) {
        video.pause();
        setTVPlaying(false);
        setActiveMedia((prev) => (prev === "tv" ? "none" : prev));
      } else {
        // Stop radio first
        stopRadio();
        setActiveMedia("tv");
        video.play().catch(console.error);
        setTVPlaying(true);
      }
    }
  }, [tvStarted, tvPlaying, stopRadio]);

  const requestTVPlay = useCallback(() => {
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

  const setTVVolume = useCallback((v: number[]) => {
    setTVVolumeState(v);
    setTVMuted(false);
  }, []);

  const toggleTVMute = useCallback(() => {
    setTVMuted((m) => !m);
  }, []);

  // Cleanup HLS on unmount
  useEffect(() => {
    return () => {
      tvHlsRef.current?.destroy();
    };
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
        // TV
        tvPlaying,
        tvStarted,
        tvVolume,
        tvMuted,
        tvVideoRef,
        tvHlsRef,
        toggleTVPlay,
        setTVVolume,
        toggleTVMute,
        tvPipActive,
        setTvPipActive,
        tvPipDismissed,
        setTvPipDismissed,
        isTVSectionVisible,
        setIsTVSectionVisible,
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

export const useTVPlayer = () => {
  const ctx = useMediaPlayer();
  return {
    isPlaying: ctx.tvPlaying,
    started: ctx.tvStarted,
    volume: ctx.tvVolume,
    isMuted: ctx.tvMuted,
    videoRef: ctx.tvVideoRef,
    hlsRef: ctx.tvHlsRef,
    togglePlay: ctx.toggleTVPlay,
    setVolume: ctx.setTVVolume,
    toggleMute: ctx.toggleTVMute,
    pipActive: ctx.tvPipActive,
    setPipActive: ctx.setTvPipActive,
    pipDismissed: ctx.tvPipDismissed,
    setPipDismissed: ctx.setTvPipDismissed,
    isSectionVisible: ctx.isTVSectionVisible,
    setSectionVisible: ctx.setIsTVSectionVisible,
  };
};
