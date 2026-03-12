import { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useTVPlayer, useMediaPlayer } from "@/hooks/useRadioPlayer";
import logo from "@/assets/logo-ganaderia-tv.png";
import AdBanner from "@/components/AdBanner";
import { useLang } from "@/contexts/LangContext";

const HeroLive = () => {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const mainVideoContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();
  
  const { activeMedia } = useMediaPlayer();
  const {
    isPlaying,
    started,
    volume,
    isMuted,
    videoRef,
    togglePlay,
    setVolume,
    toggleMute,
    pipActive,
    setPipActive,
    pipDismissed,
    setPipDismissed,
    setSectionVisible,
  } = useTVPlayer();

  // Stop TV when radio starts
  useEffect(() => {
    if (activeMedia === "radio" && isPlaying) {
      videoRef.current?.pause();
    }
  }, [activeMedia, isPlaying, videoRef]);

  // Move video element back to main container when not in PiP
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !started) return;

    if (!pipActive && mainVideoContainerRef.current) {
      if (video.parentElement !== mainVideoContainerRef.current) {
        mainVideoContainerRef.current.appendChild(video);
      }
    }
  }, [pipActive, started, videoRef]);

  // Intersection observer for PiP detection
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionVisible(entry.isIntersecting);
        
        if (entry.isIntersecting) {
          // When section comes back into view, move video back
          setPipActive(false);
          setPipDismissed(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [setSectionVisible, setPipActive, setPipDismissed]);

  // Fullscreen change handler
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Create video element once on mount
  useEffect(() => {
    if (!videoRef.current) {
      const video = document.createElement("video");
      video.className = "w-full h-full object-contain";
      video.playsInline = true;
      video.muted = isMuted;
      (videoRef as React.MutableRefObject<HTMLVideoElement>).current = video;
      
      if (mainVideoContainerRef.current) {
        mainVideoContainerRef.current.appendChild(video);
      }
    }
  }, [videoRef, isMuted]);

  const scrollToPlayer = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleVolumeChange = useCallback((v: number[]) => {
    setVolume(v);
  }, [setVolume]);

  const handleToggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMute();
  }, [toggleMute]);

  return (
    <section id="en-vivo" className="pt-0" ref={sectionRef}>
      <div className="relative bg-foreground" ref={containerRef}>
        {/* Top bar with live indicator */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 sm:px-4 md:px-8 py-2 sm:py-3 bg-gradient-to-b from-black/60 to-transparent">
          <div />
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive animate-pulse-live" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-white uppercase tracking-wide">
              {t("hero_live")}
            </span>
          </div>
        </div>

        {/* Video player */}
        <div
          onClick={togglePlay}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`w-full bg-black flex items-center justify-center relative group cursor-pointer overflow-hidden ${
            isFullscreen 
              ? 'h-full' 
              : 'aspect-video sm:aspect-[21/9] max-h-[45vh] sm:max-h-[54vh] md:max-h-[65vh]'
          }`}
        >
          {/* Video container - video element lives here when not in PiP */}
          <div
            ref={mainVideoContainerRef}
            className="absolute inset-0 w-full h-full"
          />
          {/* Vignette gradient overlay - smooth fade from black sides into video */}
          <div className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 8%, transparent 18%, transparent 82%, rgba(0,0,0,0.4) 92%, rgba(0,0,0,0.85) 100%)'
            }}
          />

          {/* Black overlay when video is in PiP */}
          {pipActive && started && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2 text-white/60">
                <span className="text-sm font-medium">{t("hero_playing_mini")}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToPlayer();
                  }}
                  className="flex items-center gap-1 text-accent text-xs font-bold hover:text-white transition-colors"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  {t("hero_back_here")}
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
                {t("hero_click_to_watch")}
              </span>
            </motion.div>
          )}

          {/* Paused overlay */}
          {started && !isPlaying && !pipActive && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30">
              <div className="h-16 w-16 rounded-full bg-primary/80 flex items-center justify-center">
                <Play className="h-8 w-8 text-primary-foreground ml-0.5" />
              </div>
            </div>
          )}

          {/* Bottom controls bar */}
          {started && !pipActive && (
            <div
              className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 sm:px-5 pt-8 pb-3 transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="text-white hover:text-accent transition-colors shrink-0">
                  {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />}
                </button>
                <span className="flex items-center gap-1.5 text-xs font-bold text-white shrink-0">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  {t("nav_live")}
                </span>
                <div className="flex-1" />
                <button onClick={handleToggleMute} className="text-white hover:text-accent transition-colors shrink-0">
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
        <div className="container mx-auto px-3 sm:px-4 flex flex-col lg:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 bg-primary-foreground rounded-lg sm:rounded-none p-3 sm:p-0">
          {/* Sponsor left */}
          <div className="hidden lg:block shrink-0 w-[200px]">
            <AdBanner placement="hero_sponsor_left" variant="sponsor_square" />
          </div>

          <div className="bg-white rounded-xl p-1.5 sm:p-2 shrink-0">
            <img src={logo} alt="Ganaderia.TV" className="h-16 sm:h-20 md:h-36 w-auto object-contain" />
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="text-base sm:text-lg md:text-2xl font-display font-bold text-primary">
              {t("hero_tagline")}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-primary">
              {t("hero_subtitle")}
            </p>
          </div>

          {/* Sponsor right */}
          <div className="hidden lg:block shrink-0 w-[200px]">
            <AdBanner placement="hero_sponsor_right" variant="sponsor_square" />
          </div>

          {/* Mobile: both sponsors in a row */}
          <div className="flex lg:hidden gap-3 w-full">
            <div className="flex-1">
              <AdBanner placement="hero_sponsor_left" variant="sponsor_square" />
            </div>
            <div className="flex-1">
              <AdBanner placement="hero_sponsor_right" variant="sponsor_square" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroLive;
