import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Milk, Beef, ArrowRight, Newspaper, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { countries, categoryFilters, categoryBadge, type Category } from "@/data/news";
import { useNews } from "@/hooks/useNews";

const categoryIcons: Record<Category, React.ReactNode> = {
  global: <Globe className="h-5 w-5" />,
  lechero: <Milk className="h-5 w-5" />,
  carne: <Beef className="h-5 w-5" />,
};

const NewsSection = () => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const { data: newsData, isLoading } = useNews();

  const filtered = (newsData || [])
    .filter((n) => {
      if (activeCategory && activeCategory !== "global" && n.category !== activeCategory) return false;
      if (activeCountry && n.country !== activeCountry) return false;
      return true;
    })
    .slice(0, 6);

  return (
    <section id="noticias" className="py-20 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Newspaper className="h-4 w-4" />
            Últimas noticias
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
            Noticias <span className="text-gradient-gold">Ganaderas</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Información actualizada del sector ganadero mundial
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8 justify-center"
        >
          {categoryFilters.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(isActive ? null : cat.key)}
                className={`
                  relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-base font-bold 
                  transition-all duration-300 overflow-hidden
                  ${isActive
                    ? `bg-gradient-to-r ${cat.color} text-primary-foreground shadow-lg scale-105`
                    : "bg-card text-foreground border-2 border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                  }
                `}
              >
                {categoryIcons[cat.key]}
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Country pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-12 justify-center"
        >
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
        </motion.div>

        {/* News grid */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          <AnimatePresence mode="popLayout">
            {filtered.map((news, i) => {
              const badge = categoryBadge[news.category as Category] || categoryBadge.global;
              return (
                <motion.article
                  key={news.id}
                  layout
                  initial={{ opacity: 0, y: 25, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-border/50 hover:border-primary/20 hover:-translate-y-1"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="text-2xl drop-shadow-lg">{news.flag}</span>
                      <span className="text-sm font-semibold text-primary-foreground drop-shadow-md">{news.country}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(news.published_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <h3 className="font-display font-bold text-lg leading-snug mt-1.5 mb-4 text-foreground group-hover:text-primary transition-colors line-clamp-3">
                      {news.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                      <span>Leer más</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
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
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-semibold">No hay noticias para estos filtros</p>
            <p className="text-sm">Prueba con otra combinación de país o categoría</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            Ver todas las noticias
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
