import { motion } from "framer-motion";
import { Crown, Check, Zap, Brain, TrendingUp, Shield, Leaf, DollarSign } from "lucide-react";
import { useAuth, PRO_PRICE_ID } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const proFeatures = [
  { icon: Brain, text: "Asesoría personalizada según tu ganado y región" },
  { icon: TrendingUp, text: "Análisis de mercados y precios en tiempo real" },
  { icon: Leaf, text: "Planes de nutrición y manejo de pasturas" },
  { icon: Shield, text: "Protocolos sanitarios y prevención de enfermedades" },
  { icon: Zap, text: "Consultas ilimitadas sin restricciones" },
  { icon: DollarSign, text: "Gestión financiera y costos de producción" },
];

const ProSection = () => {
  const { user, isPro, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: PRO_PRICE_ID },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pro" className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-base font-bold mb-4">
            <Crown className="h-5 w-5" />
            Plan Pro
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Asistente Ganadero Pro
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Asesoría personalizada con IA para llevar tu ganadería al siguiente nivel
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className={`bg-card border-2 rounded-xl p-8 shadow-lg relative overflow-hidden ${isPro ? "border-primary" : "border-border"}`}>
            {isPro && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-bl-xl">
                Tu Plan
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-foreground">
                $9.99
                <span className="text-lg font-normal text-muted-foreground">/mes</span>
              </div>
              <p className="text-muted-foreground mt-1">USD • Cancela cuando quieras</p>
            </div>

            <ul className="space-y-3 mb-8">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">{f.text}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="space-y-3">
                <div className="text-center text-sm text-muted-foreground">
                  Activo hasta {subscription.subscriptionEnd
                    ? new Date(subscription.subscriptionEnd).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })
                    : "—"}
                </div>
                <button
                  onClick={handleManage}
                  disabled={loading}
                  className="w-full h-12 rounded-xl border-2 border-border text-foreground font-medium hover:border-primary transition-colors disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Administrar suscripción"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-burgundy-light transition-colors disabled:opacity-50 shadow-md"
              >
                {loading ? "Cargando..." : user ? "Suscribirme al Plan Pro" : "Iniciar sesión para suscribirte"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProSection;
