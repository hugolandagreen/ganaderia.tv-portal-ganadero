import { motion } from "framer-motion";
import { BookOpen, Dna, Target, TrendingUp, Leaf, Heart, Globe } from "lucide-react";
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

// Fallback articles when DB is empty
const fallbackArticles = [
  { icon: "Dna", title: "Genética Bovina Avanzada", description: "Cómo seleccionar los mejores reproductores para maximizar la producción y calidad genética de tu hato.", tag: "Genética" },
  { icon: "Target", title: "Selección de Semental", description: "Guía completa para evaluar DEPs, conformación y linaje al elegir el semental ideal para tu ganadería.", tag: "Reproducción" },
  { icon: "TrendingUp", title: "Mercados Ganaderos 2026", description: "Análisis de tendencias de precios, demanda global y oportunidades para ganaderos latinoamericanos.", tag: "Mercados" },
  { icon: "BookOpen", title: "Ganadería Sostenible", description: "Prácticas regenerativas que mejoran la productividad mientras cuidan el medio ambiente y el bienestar animal.", tag: "Sostenibilidad" },
];

const ArticlesSection = () => {
  const { data: articles } = useArticles();
  const displayArticles = articles?.length ? articles : fallbackArticles;

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

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {displayArticles.map((article, i) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border-2 border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0">
                  {iconMap[article.icon] || <BookOpen className="h-7 w-7" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    {article.tag}
                  </span>
                  <h3 className="font-display font-bold text-xl mt-1 mb-2 text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {article.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
