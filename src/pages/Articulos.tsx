import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowLeft, ArrowRight, Loader2, Calendar, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import ReaderCount from "@/components/ReaderCount";
import { useLang } from "@/contexts/LangContext";

const Articulos = () => {
  const { lang, t } = useLang();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: articles, isLoading } = useArticles();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Extract unique tags and years
  const tags = [...new Set((articles || []).map((a) => a.tag))];
  const years = [...new Set((articles || []).map((a) => new Date(a.published_at).getFullYear().toString()))].sort((a, b) => b.localeCompare(a));

  const filtered = (articles || []).filter((a) => {
    if (activeTag && a.tag !== activeTag) return false;
    if (activeYear && new Date(a.published_at).getFullYear().toString() !== activeYear) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-background pt-14 sm:pt-16 lg:pt-20 pb-14 lg:pb-0">
      {/* Hero */}
      <section className="pt-8 pb-12 bg-gradient-to-b from-primary/10 via-secondary/20 to-background relative overflow-hidden">
        <div className="absolute top-10 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" /> {t("common_back_home")}
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              {t("articles_blog_title")} <span className="text-gradient-gold">{t("articles_blog_highlight")}</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("articles_blog_subtitle")}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("articles_search")}
              className="pl-10"
            />
          </div>

          {/* Tag filters */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTag === tag
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-card text-foreground border border-border hover:border-primary/30 hover:shadow-sm"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Year filters */}
          {years.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setActiveYear(activeYear === year ? null : year)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeYear === year
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  {year}
                </button>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-6">
            {t("news_showing")} <span className="font-bold text-foreground">{filtered.length}</span> {t("articles_showing")}
          </p>

          {/* Articles grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              <AnimatePresence mode="popLayout">
                {filtered.map((article, i) => {
                  const date = new Date(article.published_at);
                  const readTime = Math.max(2, Math.ceil((article.content?.length || 0) / 1000));
                  return (
                    <motion.article
                      key={article.id}
                      layout
                      initial={{ opacity: 0, y: 25, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Link
                        to={`/articulo/${article.id}`}
                        className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-border/50 hover:border-primary/20 hover:-translate-y-1 block h-full"
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden bg-muted">
                          {article.image_url ? (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                              {article.tag}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-2">
                              <span>{date.toLocaleDateString(lang === "pt" ? "pt-BR" : "es-MX", { day: "numeric", month: "short", year: "numeric" })}</span>
                              <span>·</span>
                              <span>{readTime} {t("articles_min")}</span>
                            </div>
                            <ReaderCount id={article.id} publishedAt={article.published_at} />
                          </div>
                          <h3 className="font-display font-bold text-lg leading-snug mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {article.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{article.author}</span>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                              {t("articles_read")} <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-semibold">{t("articles_no_results")}</p>
              <p className="text-sm">{t("articles_try_another")}</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Articulos;
