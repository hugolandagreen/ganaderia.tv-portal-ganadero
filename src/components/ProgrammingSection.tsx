import { motion } from "framer-motion";
import { Clock, Globe } from "lucide-react";

const schedule = [
  { time: "06:00", show: "Amanecer Ganadero", desc: "Noticias del día y precios", region: "Latinoamérica" },
  { time: "08:00", show: "Ruta Ganadera", desc: "Recorrido por fincas del mundo", region: "Global" },
  { time: "10:00", show: "Genética al Día", desc: "Avances en reproducción bovina", region: "Global" },
  { time: "12:00", show: "Mercados en Vivo", desc: "Cotizaciones y subastas", region: "Latinoamérica" },
  { time: "14:00", show: "Campo Abierto", desc: "Documentales de producción", region: "Global" },
  { time: "16:00", show: "Agro Brasil", desc: "Lo mejor de la pecuária brasileña", region: "Brasil 🇧🇷" },
  { time: "18:00", show: "Subastas Premium", desc: "Transmisión en vivo de remates", region: "Global" },
  { time: "20:00", show: "El Ganadero Moderno", desc: "Tecnología y gestión ganadera", region: "Global" },
];

const ProgrammingSection = () => {
  return (
    <section id="programacion" className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Programación del Canal
          </h2>
          <p className="text-lg text-muted-foreground">
            24 horas de contenido ganadero de clase mundial
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto bg-background rounded-xl border-2 border-border overflow-hidden">
          {schedule.map((item, i) => (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 py-5 px-6 border-b border-border last:border-0 group hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 w-24 shrink-0">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg font-bold text-primary">{item.time}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {item.show}
                </h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Globe className="h-4 w-4" />
                {item.region}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgrammingSection;
