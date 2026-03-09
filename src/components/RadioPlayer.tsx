import { Radio, Volume2, VolumeX, Play, Square } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useRadioPlayer } from "@/hooks/useRadioPlayer";
import { useLang } from "@/contexts/LangContext";

const RadioPlayer = () => {
  const { isPlaying, volume, isMuted, togglePlay, setVolume, toggleMute } = useRadioPlayer();
  const { t } = useLang();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="h-[3px] bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="bg-gradient-to-r from-[hsl(348_55%_28%)] via-[hsl(348_50%_32%)] to-[hsl(348_55%_28%)] backdrop-blur-md shadow-[0_-4px_30px_rgba(0,0,0,0.2)]">
        <div className="container mx-auto px-4 flex items-center gap-4 h-14 md:h-14">
          <button onClick={togglePlay} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center hover:bg-[hsl(var(--gold-light))] transition-all duration-300 shadow-lg glow-gold shrink-0 group">
            {isPlaying ? <Square className="h-4 w-4 text-accent-foreground" /> : <Play className="h-4 w-4 text-accent-foreground ml-0.5" />}
          </button>
          {isPlaying && (
            <div className="flex items-end gap-[3px] h-5 shrink-0">
              {[0, 0.15, 0.3, 0.1].map((delay, i) => (
                <span key={i} className="w-[3px] bg-accent rounded-full animate-bounce" style={{ animationDelay: `${delay}s`, animationDuration: "0.6s", height: `${10 + (i % 3) * 5}px` }} />
              ))}
            </div>
          )}
          <div className="flex items-center gap-2.5 min-w-0">
            <Radio className="h-4 w-4 text-accent shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-primary-foreground truncate leading-tight">{t("radio_name")}</span>
              <span className="text-[10px] font-medium text-primary-foreground/60 truncate leading-tight hidden sm:block">{t("radio_desc")}</span>
            </div>
            {isPlaying && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-accent ml-2">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                {t("nav_live_badge")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button onClick={toggleMute} className="text-primary-foreground/60 hover:text-accent transition-colors">
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <div className="w-20 md:w-28 hidden sm:block">
              <Slider value={isMuted ? [0] : volume} onValueChange={setVolume} max={100} step={1} className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent [&_.range]:bg-accent/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioPlayer;
