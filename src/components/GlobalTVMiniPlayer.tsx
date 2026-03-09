import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTVPlayer } from "@/hooks/useRadioPlayer";

const GlobalTVMiniPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isPlaying,
    started,
    isMuted,
    videoRef,
    togglePlay,
    toggleMute,
    pipActive,
    setPipActive,
    pipDismissed,
    setPipDismissed,
    isSectionVisible,
  } = useTVPlayer();

  const pipVideoContainerRef = useRef<HTMLDivElement>(null);

  // Determine if we should show PiP
  const isOnHomePage = location.pathname === "/";
  const shouldShowPip = started && isPlaying && !pipDismissed && (
    // On home page: show when section is not visible
    (isOnHomePage && !isSectionVisible) ||
    // On other pages: always show
    !isOnHomePage
  );

  // Move video element to PiP container when active
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !started) return;

    if (shouldShowPip && pipVideoContainerRef.current) {
      // Only move if not already there
      if (video.parentElement !== pipVideoContainerRef.current) {
        pipVideoContainerRef.current.appendChild(video);
        setPipActive(true);
      }
    }
  }, [shouldShowPip, started, videoRef, setPipActive]);

  // Reset pip dismissed when navigating back to home
  useEffect(() => {
    if (isOnHomePage && isSectionVisible) {
      setPipDismissed(false);
    }
  }, [isOnHomePage, isSectionVisible, setPipDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPipDismissed(true);
    setPipActive(false);
  };

  const handleGoToPlayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOnHomePage) {
      navigate("/#en-vivo");
    } else {
      const section = document.getElementById("en-vivo");
      section?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {shouldShowPip && (
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
            onClick={togglePlay}
          />

          {/* Mini controls */}
          <div className="bg-gradient-to-r from-[hsl(348_55%_28%)] to-[hsl(348_50%_32%)] px-3 py-2 flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="h-7 w-7 rounded-full bg-accent flex items-center justify-center shrink-0 hover:bg-[hsl(var(--gold-light))] transition-colors"
            >
              {isPlaying ? (
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
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="text-primary-foreground/60 hover:text-accent transition-colors"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <div className="flex-1" />

            {/* Go to full player */}
            <button
              onClick={handleGoToPlayer}
              className="flex items-center gap-1 text-[10px] font-bold text-accent hover:text-white transition-colors"
              title="Ver en grande"
            >
              <Maximize className="h-3.5 w-3.5" />
            </button>

            {/* Close PiP */}
            <button
              onClick={handleDismiss}
              className="text-primary-foreground/40 hover:text-white transition-colors"
              title="Cerrar miniatura"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalTVMiniPlayer;
