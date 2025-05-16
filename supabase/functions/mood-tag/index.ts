// supabase/mood-tag.ts
// Supabase Edge Function for mood tagging using HuggingFace
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { text } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });
    }
    // Call HuggingFace Inference API
    const HF_TOKEN = Deno.env.get("HF_TOKEN");
    const HF_MODEL = "j-hartmann/emotion-english-distilroberta-base"; // Example model
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      }
    );
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "HuggingFace API error" }), { status: 500 });
    }
    const result = await response.json();
    // Extract top mood label
    const mood = result[0]?.label || "neutral";
    return new Response(JSON.stringify({ mood }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
