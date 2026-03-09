import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Eres GanaderIA, el asistente de inteligencia artificial de Ganaderia.TV, experto en ganadería latinoamericana. Tu rol:

- Responder preguntas sobre precios de ganado (novillos, becerros, vacas, toros) en mercados de México, Colombia, Argentina, Brasil y toda Latinoamérica.
- Informar sobre tendencias del mercado ganadero, exportación e importación de carne.
- Asesorar sobre razas bovinas (Brahman, Angus, Hereford, Charolais, Simmental, Nelore, Gyr, etc.), genética y reproducción.
- Orientar sobre nutrición animal, manejo de pasturas, salud animal y bienestar.
- Compartir información sobre ferias ganaderas, subastas y eventos del sector.
- Hablar sobre tecnología agropecuaria, inseminación artificial, transferencia de embriones.

Reglas:
- Responde siempre en español.
- Sé conciso pero informativo (máximo 3-4 párrafos).
- Si no tienes datos exactos de precios actuales, indica que los precios varían y recomienda consultar fuentes locales actualizadas.
- Usa un tono profesional pero amigable, como un experto ganadero experimentado.
- Si la pregunta no es sobre ganadería, redirige amablemente al tema ganadero.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas consultas. Intenta de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Contacta al administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Error del servicio de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-ganadero error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
