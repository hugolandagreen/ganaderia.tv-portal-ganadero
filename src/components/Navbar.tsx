import { useState, useCallback } from "react";
import { Menu, X, Radio, Volume2, VolumeX, Play, Square, User, LogOut, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useNavigate, useLocation } from "react-router-dom";
import { useRadioPlayer } from "@/hooks/useRadioPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import logo from "@/assets/logo-ganaderia-tv.png";
import ganaderiaIcon from "@/assets/ganaderia-icon.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isPlaying, volume, isMuted, togglePlay, setVolume, toggleMute } = useRadioPlayer();
  const { user, isPro, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useLang();

  const navLinks = [
    { label: t("nav_live"), href: "/#en-vivo", isLive: true },
    { label: t("nav_news"), href: "/#noticias" },
    { label: t("nav_programming"), href: "/#programacion" },
    { label: t("nav_blog"), href: "/articulos" },
    { label: "GanaderIA_NAV", href: "/asistente-ia" },
  ];

  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (!href.includes("#")) {
      navigate(href);
      setOpen(false);
      return;
    }
    const [, hash] = href.split("#");
    if (location.pathname !== "/") {
      navigate("/" + (hash ? "#" + hash : ""));
    } else if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  }, [navigate, location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
        {/* Logo */}
        <a href="/" onClick={(e) => handleNavClick(e, "/#en-vivo")} className="flex items-center shrink-0 pl-4 sm:pl-6 lg:pl-8">
          <img src={logo} alt="Ganaderia.TV" className="h-10 sm:h-12 lg:h-[4.5rem] w-auto object-contain" />
        </a>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide"
            >
              {link.isLive ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-live" />
                  {link.label}
                </span>
              ) : link.label === "GanaderIA_NAV" ? (
                <span className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
                  <img src={ganaderiaIcon} alt="" className="h-9 w-9 object-contain" />
                  <span className="flex flex-col leading-none gap-0.5">
                    <span className="font-display font-extrabold text-primary tracking-tight normal-case text-base">
                      Ganader<span className="text-accent">IA</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">{t("nav_ai_assistant")}</span>
                  </span>
                </span>
              ) : (
                link.label
              )}
            </a>
          ))}
        </div>

        {/* Radio player (desktop) — integrated pill */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0 mr-1">
          <div className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-all duration-500 ${isPlaying ? "bg-primary/10 border border-primary/20" : "bg-muted/60 border border-transparent hover:border-border"}`}>
            <button
              onClick={togglePlay}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${isPlaying ? "bg-accent glow-gold hover:bg-[hsl(var(--gold-light))]" : "bg-primary hover:bg-primary/90"}`}
            >
              {isPlaying ? (
                <Square className="h-3 w-3 text-accent-foreground" />
              ) : (
                <Play className="h-3 w-3 text-primary-foreground ml-0.5" />
              )}
            </button>
            <div className={`flex items-end gap-[2px] h-3.5 transition-all duration-300 ${isPlaying ? "opacity-100 w-4" : "opacity-0 w-0"}`}>
              {[0, 0.15, 0.3, 0.1].map((delay, i) => (
                <span key={i} className="w-[2px] bg-primary rounded-full animate-bounce" style={{ animationDelay: `${delay}s`, animationDuration: "0.6s", height: `${6 + (i % 3) * 3}px` }} />
              ))}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-bold text-foreground whitespace-nowrap">{t("nav_radio")}</span>
              {isPlaying && <span className="text-[9px] font-semibold text-accent whitespace-nowrap">{t("nav_live_badge")}</span>}
            </div>
          </div>
          <div className={`flex items-center gap-1 transition-all duration-300 ${isPlaying ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
            <button onClick={toggleMute} className="text-muted-foreground hover:text-primary transition-colors">
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <div className="w-14 hidden xl:block">
              <Slider value={isMuted ? [0] : volume} onValueChange={setVolume} max={100} step={1} className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5 [&_.range]:bg-primary/60" />
            </div>
          </div>
        </div>

        {/* Language + Auth (desktop) */}
        <div className="hidden lg:flex items-center gap-2 pr-4">
          {/* Language switcher */}
          <div className="flex rounded-full border border-border overflow-hidden text-xs font-bold">
            <button onClick={() => setLang("es")} className={`px-2.5 py-1 transition-colors ${lang === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              🇪🇸 ES
            </button>
            <button onClick={() => setLang("pt")} className={`px-2.5 py-1 transition-colors ${lang === "pt" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              🇧🇷 PT
            </button>
          </div>

          {user ? (
            <>
              {isPro && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Crown className="h-3 w-3" /> PRO
                </span>
              )}
              <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <LogOut className="h-4 w-4" /> {t("nav_logout")}
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/auth")} className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
              <User className="h-4 w-4" /> {t("nav_login")}
            </button>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex lg:hidden items-center shrink-0">
          <button className="text-foreground px-3 h-14 sm:h-16 flex items-center" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-card border-b border-border overflow-hidden">
            <div className="flex flex-col gap-0 px-4 py-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-base font-semibold text-foreground hover:text-primary py-3 border-b border-border/50 last:border-0 flex items-center gap-2"
                >
                  {link.isLive && <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-live" />}
                  {link.label === "GanaderIA_NAV" ? (
                    <span className="flex items-center gap-2">
                      <img src={ganaderiaIcon} alt="" className="h-8 w-8 object-contain" />
                      <span className="flex flex-col leading-none">
                        <span className="font-display font-extrabold text-primary normal-case">Ganader<span className="text-accent">IA</span></span>
                        <span className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">{t("nav_ai_assistant")}</span>
                      </span>
                    </span>
                  ) : link.label}
                </a>
              ))}

              {/* Language switcher mobile */}
              <div className="flex items-center gap-2 py-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-medium">{t("footer_languages")}:</span>
                <button onClick={() => { setLang("es"); setOpen(false); }} className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${lang === "es" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  🇪🇸 ES
                </button>
                <button onClick={() => { setLang("pt"); setOpen(false); }} className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${lang === "pt" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  🇧🇷 PT
                </button>
              </div>

              {user ? (
                <button onClick={() => { signOut(); setOpen(false); }} className="text-base font-semibold text-foreground hover:text-primary py-3 flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> {t("nav_logout_mobile")}
                </button>
              ) : (
                <button onClick={() => { navigate("/auth"); setOpen(false); }} className="text-base font-semibold text-primary py-3 flex items-center gap-2">
                  <User className="h-4 w-4" /> {t("nav_login_mobile")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
