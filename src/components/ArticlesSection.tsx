import { motion } from "framer-motion";
import { BookOpen, Dna, Target, TrendingUp, Leaf, Heart, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="h-7 w-7" />,
  Dna: <Dna className="h-7 w-7" />,
  Target: <Target className="h-7 w-7" />,
  TrendingUp: <TrendingUp className="h-7 w-7" />,
  Leaf: <Leaf className="h-7 w-7" />,
  Heart: <Heart className="h-7 w-7" />,
  Globe: <Globe className="h-7 w-7" />,
};

const ArticlesSection = () => {
  const { data: articles } = useArticles(4);

  if (!articles?.length) return null;

  return (
    <section id="articulos" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Artículos Destacados
          </h2>
          <p className="text-lg text-muted-foreground">
            Contenido especializado para el ganadero moderno
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/articulo/${article.id}`}
                className="bg-card rounded-2xl overflow-hidden border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-300 group block h-full"
              >
                {/* Image */}
                {article.image_url ? (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent text-accent-foreground">
                        {article.tag}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="p-5 flex items-start gap-4">
                  {!article.image_url && (
                    <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0">
                      {iconMap[article.icon] || <BookOpen className="h-7 w-7" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {!article.image_url && (
                      <span className="text-xs font-bold text-accent uppercase tracking-wider">
                        {article.tag}
                      </span>
                    )}
                    <h3 className="font-display font-bold text-xl mt-1 mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {article.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Ver todos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            to="/articulos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
          >
            Ver todos los artículos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ArticlesSection;
