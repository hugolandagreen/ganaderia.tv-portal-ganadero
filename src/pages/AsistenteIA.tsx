import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Loader2, Crown, Lock, Plus, MessageSquare, Trash2, Sparkles, TrendingUp, Dna, Stethoscope, DollarSign, Wheat, Check, Brain, Zap, Shield, Leaf } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { PRO_PRICE_ID } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import RadioPlayer from "@/components/RadioPlayer";

type Message = { role: "user" | "assistant"; content: string };

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ganadero`;
const FREE_DAILY_LIMIT = 5;

const suggestionCategories = [
  {
    icon: TrendingUp,
    title: "Precios y Mercados",
    color: "text-green-500",
    questions: [
      "¿Cuál es el precio actual del novillo en pie en México?",
      "¿Cómo está el mercado de exportación de carne en Brasil?",
      "Tendencias del precio del becerro en Colombia",
    ],
  },
  {
    icon: Dna,
    title: "Genética y Razas",
    color: "text-blue-500",
    questions: [
      "¿Cuál es el mejor cruce para doble propósito en clima tropical?",
      "Características de la raza Brahman vs Nelore",
      "¿Cómo mejorar la genética de mi hato lechero?",
    ],
  },
  {
    icon: Stethoscope,
    title: "Salud Animal",
    color: "text-red-500",
    questions: [
      "Protocolo de vacunación para ganado bovino en México",
      "¿Cómo prevenir la fiebre aftosa en mi rancho?",
      "Signos de mastitis y tratamiento recomendado",
    ],
  },
  {
    icon: Wheat,
    title: "Nutrición y Pasturas",
    color: "text-amber-500",
    questions: [
      "¿Qué pastos son mejores para engorda en zona tropical?",
      "Plan nutricional para vacas en producción lechera",
      "¿Cómo suplementar ganado en época de sequía?",
    ],
  },
  {
    icon: DollarSign,
    title: "Rentabilidad",
    color: "text-emerald-500",
    questions: [
      "¿Cómo calcular el costo de producción por litro de leche?",
      "Análisis de rentabilidad de engorda en corral",
      "¿Cuántas cabezas necesito para que mi rancho sea rentable?",
    ],
  },
];

const proFeatures = [
  { icon: Brain, text: "Asesoría personalizada según tu ganado y región" },
  { icon: TrendingUp, text: "Análisis de mercados y precios en tiempo real" },
  { icon: Leaf, text: "Planes de nutrición y manejo de pasturas" },
  { icon: Shield, text: "Protocolos sanitarios y prevención" },
  { icon: Zap, text: "Consultas ilimitadas sin restricciones" },
  { icon: DollarSign, text: "Gestión financiera y costos de producción" },
];

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Error al conectar con el asistente");
    return;
  }

  if (!resp.body) {
    onError("Sin respuesta del servidor");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {}
    }
  }

  onDone();
}

const AsistenteIA = () => {
  const { user, isPro, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [proLoading, setProLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [freeCount, setFreeCount] = useState(() => {
    const stored = localStorage.getItem("ganadero_free_count");
    const storedDate = localStorage.getItem("ganadero_free_date");
    const today = new Date().toDateString();
    if (storedDate !== today) return 0;
    return stored ? parseInt(stored, 10) : 0;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    document.title = "GanaderIA – Asistente Ganadero con IA | Ganaderia.TV";
    return () => { document.title = "Ganaderia.TV"; };
  }, []);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (data) setConversations(data as Conversation[]);
    };
    load();
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!hasScrolled.current && messages.length <= 1) return;
    hasScrolled.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLimited = !isPro && freeCount >= FREE_DAILY_LIMIT;

  const loadConversation = async (convId: string) => {
    setActiveConversationId(convId);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })));
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const deleteConversation = async (convId: string) => {
    await supabase.from("chat_conversations").delete().eq("id", convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConversationId === convId) {
      startNewConversation();
    }
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from("chat_messages").insert({ conversation_id: convId, role, content });
  };

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;

    if (isLimited) {
      toast({
        title: "Límite alcanzado",
        description: "Has usado tus 5 consultas gratuitas de hoy. ¡Suscríbete a Pro para consultas ilimitadas!",
        variant: "destructive",
      });
      return;
    }

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    if (!isPro) {
      const newCount = freeCount + 1;
      setFreeCount(newCount);
      localStorage.setItem("ganadero_free_count", String(newCount));
      localStorage.setItem("ganadero_free_date", new Date().toDateString());
    }

    // Create or use conversation
    let convId = activeConversationId;
    if (!convId && user) {
      const title = msg.length > 50 ? msg.slice(0, 50) + "..." : msg;
      const { data } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, title })
        .select()
        .single();
      if (data) {
        convId = data.id;
        setActiveConversationId(data.id);
        setConversations((prev) => [data as Conversation, ...prev]);
      }
    }

    if (convId && user) {
      await saveMessage(convId, "user", msg);
    }

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && assistantSoFar.length > chunk.length) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const contextMessages = [...messages.slice(-9), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await streamChat({
        messages: contextMessages,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: async () => {
          setIsLoading(false);
          if (convId && user && assistantSoFar) {
            await saveMessage(convId, "assistant", assistantSoFar);
            await supabase
              .from("chat_conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", convId);
          }
        },
        onError: (errMsg) => {
          toast({ title: "Error", description: errMsg, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo conectar con el asistente.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <main className="min-h-screen bg-background pb-14 lg:pb-0">
      <Navbar />
      <div className="pt-14 sm:pt-16 lg:pt-20 flex h-[calc(100vh-0px)] lg:h-[calc(100vh-0px)]">
        {/* Sidebar - conversations */}
        {user && (
          <aside className={`${showSidebar ? "w-72" : "w-0"} hidden md:block bg-card border-r border-border transition-all overflow-hidden flex-shrink-0`}>
            <div className="p-4 h-full flex flex-col">
              <button
                onClick={startNewConversation}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mb-4"
              >
                <Plus className="h-4 w-4" />
                Nueva conversación
              </button>

              <div className="flex-1 overflow-y-auto space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      activeConversationId === conv.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    }`}
                    onClick={() => loadConversation(conv.id)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{conv.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Tus conversaciones aparecerán aquí
                  </p>
                )}
              </div>

              {/* Pro upsell in sidebar */}
              {!isPro && (
                <div className="mt-4 p-3 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary">Plan Pro</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Consultas ilimitadas y asesoría personalizada</p>
                  <button
                    onClick={async () => {
                      if (!user) { navigate("/auth"); return; }
                      setProLoading(true);
                      try {
                        const { data, error } = await supabase.functions.invoke("create-checkout", { body: { priceId: PRO_PRICE_ID } });
                        if (error) throw error;
                        if (data?.url) window.open(data.url, "_blank");
                      } catch (e: any) {
                        toast({ title: "Error", description: e.message, variant: "destructive" });
                      } finally { setProLoading(false); }
                    }}
                    disabled={proLoading}
                    className="w-full text-xs py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {proLoading ? "Cargando..." : "$9.99/mes"}
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">GanaderIA</h1>
              <p className="text-xs text-muted-foreground">
                {isPro
                  ? "Consultas ilimitadas • Asesoría personalizada"
                  : `${FREE_DAILY_LIMIT - freeCount} consultas gratuitas restantes hoy`}
              </p>
            </div>
            {isPro && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <Crown className="h-3 w-3" /> PRO
              </span>
            )}
            {!user && (
              <button
                onClick={() => navigate("/auth")}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Iniciar sesión para guardar chats
              </button>
            )}
          </div>

          {/* Messages or Welcome */}
          <div className="flex-1 overflow-y-auto">
            {showWelcome ? (
              <div className="max-w-3xl mx-auto px-4 py-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                   <h2 className="text-2xl font-bold text-foreground mb-2">
                    Bienvenido a <span className="text-primary">GanaderIA</span>
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Soy tu asistente ganadero con inteligencia artificial. Pregúntame sobre precios, razas, nutrición, salud animal y más.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestionCategories.map((cat, idx) => (
                    <motion.div
                      key={cat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <cat.icon className={`h-5 w-5 ${cat.color}`} />
                        <h3 className="font-semibold text-foreground text-sm">{cat.title}</h3>
                      </div>
                      <div className="space-y-2">
                        {cat.questions.map((q) => (
                          <button
                            key={q}
                            onClick={() => handleSend(q)}
                            disabled={isLoading || isLimited}
                            className="w-full text-left text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pro banner in welcome */}
                {!isPro && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-2xl mx-auto mt-8"
                  >
                    <div className="bg-card border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="h-5 w-5 text-primary" />
                          <h3 className="font-bold text-foreground">GanaderIA Pro</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">$9.99/mes</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Asesoría personalizada con IA para llevar tu ganadería al siguiente nivel
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {proFeatures.slice(0, 4).map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="h-3 w-3 text-primary flex-shrink-0" />
                              {f.text}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!user) { navigate("/auth"); return; }
                          setProLoading(true);
                          try {
                            const { data, error } = await supabase.functions.invoke("create-checkout", { body: { priceId: PRO_PRICE_ID } });
                            if (error) throw error;
                            if (data?.url) window.open(data.url, "_blank");
                          } catch (e: any) {
                            toast({ title: "Error", description: e.message, variant: "destructive" });
                          } finally { setProLoading(false); }
                        }}
                        disabled={proLoading}
                        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md whitespace-nowrap"
                      >
                        {proLoading ? "Cargando..." : user ? "Suscribirme" : "Acceder para suscribirte"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-3 text-base whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      {msg.role === "assistant" && (
                        <Bot className="h-4 w-4 mb-1 text-primary inline-block mr-1.5" />
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl px-4 py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Limit banner */}
          {isLimited && (
            <div className="mx-4 mb-2 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1 text-sm text-foreground">
                Has alcanzado tu límite diario.{" "}
                <button
                  onClick={() => navigate("/#pro")}
                  className="text-primary font-bold hover:underline"
                >
                  ¡Hazte Pro para consultas ilimitadas!
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border bg-card p-4">
            <div className="max-w-3xl mx-auto flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isLimited ? "Suscríbete a Pro para continuar..." : "Pregunta sobre precios, razas, mercados..."}
                disabled={isLoading || isLimited}
                className="flex-1 bg-background rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground border-2 border-border focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim() || isLimited}
                className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md"
              >
                <Send className="h-5 w-5 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <RadioPlayer />
    </main>
  );
};

export default AsistenteIA;
