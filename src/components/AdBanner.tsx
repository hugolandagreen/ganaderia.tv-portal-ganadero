import { motion } from "framer-motion";
import { ExternalLink, Megaphone, Mail } from "lucide-react";
import { useSponsors, type AdPlacement } from "@/hooks/useSponsors";
import { useLang } from "@/contexts/LangContext";

interface AdBannerProps {
  placement: AdPlacement | AdPlacement[];
  variant?: "banner" | "inline" | "sidebar" | "leaderboard";
  className?: string;
}

const placeholderTexts = {
  es: {
    title: "¡Anuncia tu marca aquí!",
    subtitle: "Llega a miles de ganaderos en Latinoamérica y el mundo",
    cta: "Contáctanos",
  },
  pt: {
    title: "Anuncie sua marca aqui!",
    subtitle: "Alcance milhares de pecuaristas na América Latina e no mundo",
    cta: "Entre em contato",
  },
};

const AdBanner = ({ placement, variant = "banner", className = "" }: AdBannerProps) => {
  const { data: sponsors } = useSponsors(placement);
  const { lang } = useLang();
  const txt = placeholderTexts[lang];

  // If there are active sponsors, render them
  if (sponsors && sponsors.length > 0) {
    return (
      <div className={className}>
        {sponsors.map((sponsor) => (
          <motion.div
            key={sponsor.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {variant === "banner" && (
              <a
                href={sponsor.link_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block relative overflow-hidden rounded-2xl border border-border/50 group hover:shadow-lg transition-all"
              >
                <div className="relative h-28 sm:h-36 md:h-44 overflow-hidden">
                  <img
                    src={sponsor.image_url}
                    alt={sponsor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center px-6 sm:px-10">
                    <div className="text-white max-w-lg">
                      {sponsor.badge_text && (
                        <span className="inline-block text-[10px] uppercase tracking-wider font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full mb-2">
                          {sponsor.badge_text}
                        </span>
                      )}
                      <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl mb-1 drop-shadow-md">
                        {sponsor.name}
                      </h3>
                      {sponsor.description && (
                        <p className="text-xs sm:text-sm text-white/80 mb-3 line-clamp-2">{sponsor.description}</p>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-accent group-hover:gap-2.5 transition-all">
                        {sponsor.cta_text} <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            )}

            {variant === "inline" && (
              <a
                href={sponsor.link_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <img
                  src={sponsor.image_url}
                  alt={sponsor.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  {sponsor.badge_text && (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-accent">{sponsor.badge_text}</span>
                  )}
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">{sponsor.name}</h4>
                  {sponsor.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{sponsor.description}</p>
                  )}
                </div>
                <span className="text-xs font-bold text-primary flex items-center gap-1 shrink-0">
                  {sponsor.cta_text} <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            )}

            {variant === "sidebar" && (
              <a
                href={sponsor.link_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block rounded-xl border border-border overflow-hidden bg-card hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={sponsor.image_url}
                    alt={sponsor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {sponsor.badge_text && (
                    <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      {sponsor.badge_text}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{sponsor.name}</h4>
                  {sponsor.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sponsor.description}</p>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-2">
                    {sponsor.cta_text} <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            )}

            {variant === "leaderboard" && (
              <a
                href={sponsor.link_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block relative overflow-hidden rounded-xl group"
              >
                <img
                  src={sponsor.image_url}
                  alt={sponsor.name}
                  className="w-full h-20 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </a>
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  // Placeholder – invite advertisers
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={className}
    >
      {variant === "banner" && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Megaphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                  {txt.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {txt.subtitle}
                </p>
              </div>
            </div>
            <a
              href="mailto:publicidad@ganaderia.tv"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-md"
            >
              <Mail className="h-4 w-4" />
              {txt.cta}
            </a>
          </div>
          <a
            href="mailto:publicidad@ganaderia.tv"
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 border-t border-primary/10 text-sm font-bold text-primary"
          >
            <Mail className="h-4 w-4" />
            {txt.cta}
          </a>
        </div>
      )}

      {variant === "inline" && (
        <a
          href="mailto:publicidad@ganaderia.tv"
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{txt.title}</p>
            <p className="text-xs text-muted-foreground">{txt.subtitle}</p>
          </div>
          <Mail className="h-4 w-4 text-primary shrink-0" />
        </a>
      )}

      {variant === "sidebar" && (
        <a
          href="mailto:publicidad@ganaderia.tv"
          className="block rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-colors text-center group"
        >
          <Megaphone className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground mb-1">{txt.title}</p>
          <p className="text-[11px] text-muted-foreground mb-3">{txt.subtitle}</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            <Mail className="h-3 w-3" /> {txt.cta}
          </span>
        </a>
      )}

      {variant === "leaderboard" && (
        <a
          href="mailto:publicidad@ganaderia.tv"
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 border-dashed border-primary/15 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-colors"
        >
          <Megaphone className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{txt.title}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">— publicidad@ganaderia.tv</span>
        </a>
      )}
    </motion.div>
  );
};

export default AdBanner;
