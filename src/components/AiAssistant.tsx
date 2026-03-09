import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Loader2, Crown, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type Message = { role: "user" | "assistant"; content: string };

const freeQuestions = [
  "Precio del novillo en Argentina",
  "Mercado lechero en Colombia",
  "Becerro en México",
  "Exportación de carne en Brasil",
];

const proQuestions = [
  "Plan nutricional para Brahman en zona tropical",
  "Protocolo sanitario para aftosa en mi región",
  "Análisis financiero de mi hato ganadero",
  "Genética: cruce ideal para doble propósito",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ganadero`;

const FREE_DAILY_LIMIT = 5;

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

const AiAssistant = () => {
  const { user, isPro } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy el Asistente Ganadero de Ganaderia.TV con inteligencia artificial. Pregúntame sobre precios de ganado, tendencias de mercado, razas, genética bovina o cualquier tema ganadero. ¿En qué te puedo ayudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [freeCount, setFreeCount] = useState(() => {
    const stored = localStorage.getItem("ganadero_free_count");
    const storedDate = localStorage.getItem("ganadero_free_date");
    const today = new Date().toDateString();
    if (storedDate !== today) return 0;
    return stored ? parseInt(stored, 10) : 0;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const { toast } = useToast();

  useEffect(() => {
    // Skip auto-scroll on initial render to prevent scrolling to this section on page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLimited = !isPro && freeCount >= FREE_DAILY_LIMIT;

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
        onDone: () => setIsLoading(false),
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

  const questions = isPro ? proQuestions : freeQuestions;

  return (
    <section id="ia" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-muted text-primary text-base font-bold mb-4">
            <Bot className="h-5 w-5" />
            Inteligencia Artificial
            {isPro && (
              <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                <Crown className="h-3 w-3" /> PRO
              </span>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Asistente Ganadero IA
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {isPro
              ? "Asesoría personalizada ilimitada para tu ganadería"
              : `Consulta precios, mercados y tendencias ganaderas (${FREE_DAILY_LIMIT - freeCount} consultas restantes hoy)`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-card border-2 border-border rounded-xl overflow-hidden shadow-lg"
        >
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-5 space-y-4">
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

          {/* Limit banner */}
          {isLimited && (
            <div className="mx-5 mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1 text-sm text-foreground">
                Has alcanzado tu límite diario.{" "}
                <button
                  onClick={() => {
                    const el = document.getElementById("pro");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  ¡Hazte Pro para consultas ilimitadas!
                </button>
              </div>
            </div>
          )}

          {/* Quick questions */}
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isLoading || isLimited}
                className="text-sm px-4 py-2 rounded-lg border-2 border-border bg-background text-foreground font-medium hover:border-primary transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t-2 border-border flex gap-3">
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
              className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center hover:bg-burgundy-light transition-colors disabled:opacity-50 shadow-md"
            >
              <Send className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AiAssistant;
