import { useState, useCallback } from "react";
import { Menu, X, Radio, Volume2, VolumeX, Play, Square, User, LogOut, Crown, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useNavigate, useLocation } from "react-router-dom";
import { useRadioPlayer } from "@/hooks/useRadioPlayer";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-ganaderia-tv.png";
import ganaderiaIcon from "@/assets/ganaderia-icon.png";

const navLinks = [
  { label: "EN VIVO", href: "/#en-vivo" },
  { label: "Noticias", href: "/#noticias" },
  { label: "Programación", href: "/#programacion" },
  { label: "Artículos", href: "/#articulos" },
  { label: "GanaderIA_NAV", href: "/asistente-ia" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isPlaying, volume, isMuted, togglePlay, setVolume, toggleMute } = useRadioPlayer();
  const { user, isPro, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    // Direct page links (not hash-based)
    if (!href.includes("#")) {
      navigate(href);
      setOpen(false);
      return;
    }
    const [path, hash] = href.split("#");
    if (location.pathname !== "/") {
      navigate("/" + (hash ? "#" + hash : ""));
    } else if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
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
              {link.label === "EN VIVO" ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-live" />
                  {link.label}
                </span>
              ) : link.label === "GanaderIA_NAV" ? (
                <span className="flex flex-col items-center leading-none gap-0.5">
                  <span className="flex items-center gap-1">
                    <img src={ganaderiaIcon} alt="" className="h-5 w-5" />
                    <span className="font-display font-extrabold text-primary tracking-tight normal-case">
                      Ganader<span className="text-accent">IA</span>
                    </span>
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">Asistente IA</span>
                </span>
              ) : (
                link.label
              )}
            </a>
          ))}
        </div>

        {/* Radio player (desktop) */}
        <div className="hidden lg:flex items-center gap-2 h-20 bg-gradient-to-r from-[hsl(348_55%_28%)] via-[hsl(348_50%_32%)] to-[hsl(348_55%_28%)] px-4 shrink-0 border-2 border-accent">
          <button
            onClick={togglePlay}
            className="h-8 w-8 rounded-full bg-accent flex items-center justify-center hover:bg-[hsl(var(--gold-light))] transition-all duration-300 shadow-md glow-gold shrink-0"
          >
            {isPlaying ? (
              <Square className="h-3.5 w-3.5 text-accent-foreground" />
            ) : (
              <Play className="h-3.5 w-3.5 text-accent-foreground ml-0.5" />
            )}
          </button>

          <div className={`flex items-end gap-[2px] h-4 shrink-0 transition-opacity ${isPlaying ? "opacity-100" : "opacity-0"}`}>
            {[0, 0.15, 0.3, 0.1].map((delay, i) => (
              <span
                key={i}
                className="w-[2px] bg-accent rounded-full animate-bounce"
                style={{
                  animationDelay: `${delay}s`,
                  animationDuration: "0.6s",
                  height: `${8 + (i % 3) * 4}px`,
                }}
              />
            ))}
          </div>

          <Radio className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="text-xs font-bold text-primary-foreground whitespace-nowrap">
            Radio Ganadera
          </span>

          <span className={`hidden xl:flex items-center gap-1 text-[10px] font-bold text-accent transition-opacity ${isPlaying ? "opacity-100" : "opacity-0"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            VIVO
          </span>

          <button
            onClick={toggleMute}
            className="text-primary-foreground/60 hover:text-accent transition-colors ml-1"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <div className="w-16 hidden xl:block">
            <Slider
              value={isMuted ? [0] : volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_.range]:bg-accent/80"
            />
          </div>
        </div>

        {/* Auth buttons (desktop) */}
        <div className="hidden lg:flex items-center gap-2 pr-4">
          {user ? (
            <>
              {isPro && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Crown className="h-3 w-3" /> PRO
                </span>
              )}
              <button
                onClick={signOut}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <User className="h-4 w-4" /> Acceder
            </button>
          )}
        </div>

        {/* Mobile/Tablet: hamburger only */}
        <div className="flex lg:hidden items-center shrink-0">
          <button className="text-foreground px-3 h-14 sm:h-16 flex items-center" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="flex flex-col gap-0 px-4 py-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-base font-semibold text-foreground hover:text-primary py-3 border-b border-border/50 last:border-0 flex items-center gap-2"
                >
                  {link.label === "EN VIVO" && (
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-live" />
                  )}
                  {link.label === "GanaderIA_NAV" ? (
                    <span className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="flex flex-col leading-none">
                        <span className="font-display font-extrabold text-primary normal-case">
                          Ganader<span className="text-accent">IA</span>
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">Asistente IA</span>
                      </span>
                    </span>
                  ) : (
                    link.label
                  )}
                  
                </a>
              ))}
              {/* Mobile auth */}
              {user ? (
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="text-base font-semibold text-foreground hover:text-primary py-3 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              ) : (
                <button
                  onClick={() => { navigate("/auth"); setOpen(false); }}
                  className="text-base font-semibold text-primary py-3 flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Acceder / Registrarse
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
