import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Globe, Clock, Share2 } from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { categoryBadge, type Category } from "@/data/news";

const NoticiaDetalle = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: news, isLoading, error } = useQuery({
    queryKey: ["news", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background pt-14 sm:pt-16 lg:pt-20">
        <div className="pt-28 pb-20 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !news) {
    return (
      <main className="min-h-screen bg-background pt-14 sm:pt-16 lg:pt-20">
        <div className="pt-28 pb-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Noticia no encontrada</h1>
          <Link to="/noticias" className="text-primary hover:underline">
            Volver a noticias
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const badge = categoryBadge[news.category as Category] || categoryBadge.lechero;
  const publishedDate = new Date(news.published_at);
  const readTime = Math.max(2, Math.ceil((news.content?.length || 0) / 1000));

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: news.title,
        text: news.summary || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Image */}
      <section className="relative pt-20">
        <div className="h-[40vh] md:h-[50vh] relative overflow-hidden">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      </section>

      {/* Content */}
      <section className="relative -mt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            {/* Back link */}
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:gap-3 transition-all bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a noticias
            </Link>

            {/* Article card */}
            <div className="bg-card rounded-3xl shadow-xl p-6 md:p-10 border border-border/50">
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${badge.classes}`}>
                  {badge.label}
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <span className="text-xl">{news.flag}</span>
                  <span>{news.country}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-6">
                {news.title}
              </h1>

              {/* Author and date row */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{news.author}</p>
                    <p className="text-xs">Autor</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {publishedDate.toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readTime} min de lectura</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="ml-auto"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartir
                </Button>
              </div>

              {/* Summary */}
              {news.summary && (
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 font-medium italic border-l-4 border-primary pl-4">
                  {news.summary}
                </p>
              )}

              {/* Content */}
              {news.content ? (
                <div
                  className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-strong:text-foreground"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
              ) : (
                <p className="text-muted-foreground italic">
                  El contenido completo de esta noticia aún no está disponible.
                </p>
              )}
            </div>
          </motion.article>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default NoticiaDetalle;
