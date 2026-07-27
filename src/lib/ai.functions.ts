import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const StoryInput = z.object({
  title: z.string().max(160).default(""),
  rawText: z.string().min(3).max(3000),
  feeling: z.string().max(40).nullable().optional(),
  childName: z.string().max(80).nullable().optional(),
  chapterTitle: z.string().max(120).nullable().optional(),
});

export const writeStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => StoryInput.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("A escrita automática não está disponível agora.");

    const child = data.childName?.trim() || "seu filho";
    const system = [
      "Você é um escritor brasileiro de memórias familiares.",
      "Transforme anotações curtas de pais em um parágrafo emocionante, íntimo e elegante, escrito em português do Brasil.",
      "Escreva em segunda pessoa, como se os pais falassem diretamente com a criança.",
      "De 3 a 5 frases. Nada de clichês exagerados, nada infantil, nada de emojis, nada de títulos.",
      "Preserve todos os fatos informados. Não invente nomes, datas ou lugares.",
      "Devolva apenas o texto final.",
    ].join(" ");

    const user = [
      data.chapterTitle ? `Capítulo: ${data.chapterTitle}` : null,
      data.title ? `Momento: ${data.title}` : null,
      data.feeling ? `Sentimento dos pais: ${data.feeling}` : null,
      `Nome da criança: ${child}`,
      `Anotação: ${data.rawText}`,
    ]
      .filter(Boolean)
      .join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (response.status === 429) {
      throw new Error("Muitos pedidos ao mesmo tempo. Tente novamente em instantes.");
    }
    if (response.status === 402) {
      throw new Error("Os créditos de escrita automática acabaram.");
    }
    if (!response.ok) {
      throw new Error("Não conseguimos escrever essa história agora.");
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Não conseguimos escrever essa história agora.");
    return { story: text };
  });
