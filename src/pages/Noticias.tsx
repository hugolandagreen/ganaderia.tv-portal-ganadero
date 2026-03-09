import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Milk, Beef, ArrowRight, ArrowLeft, Newspaper, Loader2, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { countries, categoryFilters, categoryBadge, type Category } from "@/data/news";
import { useNews } from "@/hooks/useNews";
import ReaderCount from "@/components/ReaderCount";
import AdBanner from "@/components/AdBanner";
import { useLang } from "@/contexts/LangContext";

const categoryIcons: Record<Category, React.ReactNode> = {
  lechero: <Milk className="h-5 w-5" />,
  carne: <Beef className="h-5 w-5" />,
  doble_proposito: <Target className="h-5 w-5" />,
};

const categoryLabels: Record<Category, { es: string; pt: string }> = {
  lechero: { es: "Ganado Lechero", pt: "Gado Leiteiro" },
  carne: { es: "Ganado de Carne", pt: "Gado de Corte" },
  doble_proposito: { es: "Ganado Doble Propósito", pt: "Gado Dupla Aptidão" },
};

const Noticias = () => {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const { data: newsData, isLoading } = useNews();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filtered = (newsData || []).filter((n) => {
    if (activeCategory && n.category !== activeCategory) return false;
    if (activeCountry && n.country !== activeCountry) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-background pt-14 sm:pt-16 lg:pt-20">

      {/* Hero header */}
      <section className="pt-8 pb-12 bg-gradient-to-b from-primary/10 via-secondary/20 to-background relative overflow-hidden">
        <div className="absolute top-10 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" />
            {t("common_back_home")}
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              {t("news_page_title")} <span className="text-gradient-gold">{t("news_page_highlight")}</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("news_page_subtitle")}
          </p>
        </div>
      </section>

      {/* Filters + Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {/* Category filters */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {categoryFilters.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(isActive ? null : cat.key)}
                  className={`
                    flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-base font-bold 
                    transition-all duration-300
                    ${isActive
                      ? `bg-gradient-to-r ${cat.color} text-primary-foreground shadow-lg scale-105`
                      : "bg-card text-foreground border-2 border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                    }
                  `}
                >
                  {categoryIcons[cat.key]}
                  {categoryLabels[cat.key][lang]}
                </button>
              );
            })}
          </div>

          {/* Country pills */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {countries.map((c) => {
              const isActive = activeCountry === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setActiveCountry(isActive ? null : c.name)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold 
                    transition-all duration-200
                    ${isActive
                      ? "bg-accent text-primary-foreground shadow-md scale-105 ring-2 ring-accent/30"
                      : "bg-card/80 text-foreground border border-border hover:bg-card hover:border-accent/40 hover:shadow-sm"
                    }
                  `}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {t("news_showing")} <span className="font-bold text-foreground">{filtered.length}</span> {t("news_count_label")}
          </p>

          {/* News grid */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            <AnimatePresence mode="popLayout">
              {filtered.map((news, i) => {
                const badge = categoryBadge[news.category as Category] || categoryBadge.lechero;
                const badgeLabel = categoryLabels[news.category as Category]?.[lang] || badge.label;
                return (
                  <motion.article
                    key={news.id}
                    layout
                    initial={{ opacity: 0, y: 25, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Link
                      to={`/noticia/${news.id}`}
                      className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-border/50 hover:border-primary/20 hover:-translate-y-1 block"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={news.image_url}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.classes}`}>
                            {badgeLabel}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <span className="text-2xl drop-shadow-lg">{news.flag}</span>
                          <span className="text-sm font-semibold text-primary-foreground drop-shadow-md">{news.country}</span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            {new Date(news.published_at).toLocaleDateString(lang === "pt" ? "pt-BR" : "es-MX", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <ReaderCount id={news.id} publishedAt={news.published_at} />
                        </div>
                        <h3 className="font-display font-bold text-lg leading-snug mt-1.5 mb-2 text-foreground group-hover:text-primary transition-colors">
                          {news.title}
                        </h3>
                        {news.summary && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{news.summary}</p>
                        )}
                        <div className="flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                          <span>{t("news_read_more")}</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-semibold">{t("news_no_results")}</p>
              <p className="text-sm">{t("news_try_another")}</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Noticias;
