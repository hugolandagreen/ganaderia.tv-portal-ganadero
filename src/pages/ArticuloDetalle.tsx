import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Clock, BookOpen } from "lucide-react";
import Footer from "@/components/Footer";
import ReaderCount from "@/components/ReaderCount";
import SocialShare from "@/components/SocialShare";

const ArticuloDetalle = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
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

  if (error || !article) {
    return (
      <main className="min-h-screen bg-background pt-14 sm:pt-16 lg:pt-20">
        <div className="pt-28 pb-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artículo no encontrado</h1>
          <Link to="/articulos" className="text-primary hover:underline">
            Volver al blog
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const publishedDate = new Date(article.published_at);
  const readTime = Math.max(2, Math.ceil((article.content?.length || 0) / 1000));

  return (
    <main className="min-h-screen bg-background pt-14 sm:pt-16 lg:pt-20">
      {/* Hero Image */}
      <section className="relative pt-20">
        <div className="h-[40vh] md:h-[50vh] relative overflow-hidden">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
              <BookOpen className="h-20 w-20 text-primary/20" />
            </div>
          )}
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
            <Link
              to="/articulos"
              className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:gap-3 transition-all bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>

            <div className="bg-card rounded-3xl shadow-xl p-6 md:p-10 border border-border/50">
              {/* Tag */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-primary text-primary-foreground">
                  {article.tag}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-6">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{article.author}</p>
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
                <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartir
                </Button>
              </div>

              {/* Description */}
              {article.description && (
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 font-medium italic border-l-4 border-primary pl-4">
                  {article.description}
                </p>
              )}

              {/* Content */}
              {article.content ? (
                <div
                  className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-strong:text-foreground"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <p className="text-muted-foreground italic">
                  El contenido completo de este artículo aún no está disponible.
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

export default ArticuloDetalle;
