import { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import Hls from "hls.js";
import { createPortal } from "react-dom";
import { useMediaPlayer } from "@/hooks/useRadioPlayer";
import logo from "@/assets/logo-ganaderia-tv.png";

const STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const HeroLive = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const pipVideoContainerRef = useRef<HTMLDivElement>(null);
  const mainVideoContainerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [pipDismissed, setPipDismissed] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();
  const { activeMedia, requestTVPlay, requestTVStop } = useMediaPlayer();

  // Stop TV when radio starts
  useEffect(() => {
    if (activeMedia === "radio" && playing) {
      videoRef.current?.pause();
      setPlaying(false);
    }
  }, [activeMedia, playing]);

  // Move video element between main and pip containers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !started) return;

    if (isPip && pipVideoContainerRef.current) {
      pipVideoContainerRef.current.appendChild(video);
    } else if (!isPip && mainVideoContainerRef.current) {
      mainVideoContainerRef.current.appendChild(video);
    }
  }, [isPip, started]);

  // PiP: detect when video scrolls out of view
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && playing && started && !pipDismissed) {
          setIsPip(true);
        } else if (entry.isIntersecting) {
          setIsPip(false);
          setPipDismissed(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [playing, started, pipDismissed]);

  useEffect(() => {
    return () => {
      hlsRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume[0] / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!started) {
      requestTVPlay();
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(STREAM_URL);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(console.error);
        });
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = STREAM_URL;
        video.play().catch(console.error);
      }
      setStarted(true);
      setPlaying(true);
    } else {
      if (playing) {
        video.pause();
        setPlaying(false);
        requestTVStop();
      } else {
        requestTVPlay();
        video.play().catch(console.error);
        setPlaying(true);
      }
    }
  }, [started, playing, requestTVPlay, requestTVStop]);

  const scrollToPlayer = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const dismissPip = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPipDismissed(true);
    setIsPip(false);
  }, []);

  const toggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((m) => !m);
  }, []);

  const handleVolumeChange = useCallback((v: number[]) => {
    setVolume(v);
    setIsMuted(false);
  }, []);

  const handleMouseMove = useCallback(() => {
    if (!started) return;
    setShowControls(true);
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, [started]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(hideTimeout.current);
    setShowControls(false);
  }, []);

  return (
    <>
      <section id="en-vivo" className="pt-0" ref={sectionRef}>
        <div className="relative bg-foreground" ref={containerRef}>
          {/* Top bar with live indicator */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 sm:px-4 md:px-8 py-2 sm:py-3 bg-gradient-to-b from-black/60 to-transparent">
            <div />
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive animate-pulse-live" />
              <span className="text-xs sm:text-sm md:text-base font-bold text-white uppercase tracking-wide">
                En Vivo
              </span>
            </div>
          </div>

          {/* Video player */}
          <div
            onClick={handlePlay}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full aspect-video sm:aspect-[21/9] max-h-[50vh] sm:max-h-[60vh] md:max-h-[72vh] bg-black flex items-center justify-center relative group cursor-pointer overflow-hidden"
          >
            {/* Video container - video element lives here when not in PiP */}
            <div
              ref={mainVideoContainerRef}
              className="absolute inset-0 w-full h-full"
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted={isMuted}
              />
            </div>

            {/* Black overlay when video is in PiP */}
            {isPip && started && (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2 text-white/60">
                  <span className="text-sm font-medium">Reproduciendo en miniatura</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToPlayer();
                    }}
                    className="flex items-center gap-1 text-accent text-xs font-bold hover:text-white transition-colors"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    Volver aquí
                  </button>
                </div>
              </div>
            )}

            {/* Initial play overlay */}
            {!started && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 sm:gap-4 z-10"
              >
                <div className="h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all shadow-2xl">
                  <Play className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary-foreground ml-0.5 sm:ml-1" />
                </div>
                <span className="text-xs sm:text-base md:text-lg font-semibold text-white/80 text-center px-4">
                  Haz clic para ver Ganaderia.TV en vivo
                </span>
              </motion.div>
            )}

            {/* Paused overlay */}
            {started && !playing && !isPip && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30">
                <div className="h-16 w-16 rounded-full bg-primary/80 flex items-center justify-center">
                  <Play className="h-8 w-8 text-primary-foreground ml-0.5" />
                </div>
              </div>
            )}

            {/* Bottom controls bar */}
            {started && !isPip && (
              <div
                className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 sm:px-5 pt-8 pb-3 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <button onClick={handlePlay} className="text-white hover:text-accent transition-colors shrink-0">
                    {playing ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />}
                  </button>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white shrink-0">
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    EN VIVO
                  </span>
                  <div className="flex-1" />
                  <button onClick={toggleMute} className="text-white hover:text-accent transition-colors shrink-0">
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <div className="w-20 hidden sm:block" onClick={(e) => e.stopPropagation()}>
                    <Slider
                      value={isMuted ? [0] : volume}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_.range]:bg-white/80"
                    />
                  </div>
                  <button onClick={toggleFullscreen} className="text-white hover:text-accent transition-colors shrink-0">
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Branding strip */}
        <div className="bg-gradient-burgundy py-3 sm:py-5">
          <div className="container mx-auto px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6 bg-primary-foreground rounded-lg sm:rounded-none p-3 sm:p-0">
            <div className="bg-white rounded-xl p-1.5 sm:p-2">
              <img src={logo} alt="Ganaderia.TV" className="h-16 sm:h-20 md:h-36 w-auto object-contain" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-base sm:text-lg md:text-2xl font-display font-bold text-primary">
                La referencia mundial de la ganadería
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-primary">
                Programación 24/7 · Noticias · Genética · Mercados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Picture-in-Picture floating mini player */}
      <AnimatePresence>
        {isPip && started && playing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-16 lg:bottom-4 right-4 z-[60] w-[260px] sm:w-[300px] md:w-[340px] rounded-xl overflow-hidden shadow-2xl border-2 border-accent"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
          >
            {/* PiP video container */}
            <div
              ref={pipVideoContainerRef}
              className="relative aspect-video bg-black cursor-pointer"
              onClick={handlePlay}
            />

            {/* Mini controls */}
            <div className="bg-gradient-to-r from-[hsl(348_55%_28%)] to-[hsl(348_50%_32%)] px-3 py-2 flex items-center gap-2">
              <button
                onClick={handlePlay}
                className="h-7 w-7 rounded-full bg-accent flex items-center justify-center shrink-0 hover:bg-[hsl(var(--gold-light))] transition-colors"
              >
                {playing ? (
                  <Pause className="h-3.5 w-3.5 text-accent-foreground" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-accent-foreground ml-0.5" />
                )}
              </button>

              <span className="flex items-center gap-1 text-[10px] font-bold text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                EN VIVO
              </span>

              <button
                onClick={(e) => toggleMute(e)}
                className="text-primary-foreground/60 hover:text-accent transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <div className="flex-1" />

              {/* Back to full player */}
              <button
                onClick={scrollToPlayer}
                className="flex items-center gap-1 text-[10px] font-bold text-accent hover:text-white transition-colors"
                title="Volver al reproductor"
              >
                <Maximize className="h-3.5 w-3.5" />
              </button>

              {/* Close PiP */}
              <button
                onClick={dismissPip}
                className="text-primary-foreground/40 hover:text-white transition-colors"
                title="Cerrar miniatura"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeroLive;
