import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = (process.env.AI_API_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
    const model = process.env.AI_MODEL || "deepseek-chat";

    if (!apiKey) {
      return NextResponse.json({ error: "AI_API_KEY not configured" }, { status: 500 });
    }

    const prompt = `Traduza o texto abaixo para o português brasileiro (pt-BR). 
Mantenha nomes próprios, números e termos técnicos inalterados.
Responda APENAS com o texto traduzido, sem explicações.

Texto original:
${text}`;

    const response = await fetch(`${baseUrl}${baseUrl.includes("/v1") ? "" : "/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Você é um tradutor especializado em português brasileiro. Traduza textos de forma natural e precisa." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "Unknown error");
      return NextResponse.json(
        { error: `AI API error: ${response.status}`, detail: errBody.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await response.json();
    // Support both standard OpenAI format (message.content) and
    // streaming/delta format used by some providers (delta.content)
    const choice = data?.choices?.[0];
    const translated = (choice?.message?.content || choice?.delta?.content || "").trim();

    if (!translated) {
      return NextResponse.json({ error: "Empty response from AI", detail: JSON.stringify(data).slice(0, 500) }, { status: 502 });
    }

    return NextResponse.json({ success: true, translated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
