import { NextResponse } from "next/server";

type ParsedTask = {
  title: string;
  duration_min: number;
  priority: 1 | 2 | 3;
  energy: "high" | "medium" | "low";
};

type ParsedResponse = {
  tasks: ParsedTask[];
};

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text?: string };

    if (!text || text.trim().length < 3) {
      return NextResponse.json({ error: "Texto inválido." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    // Prompt: força saída estruturada em JSON (robusto para automação)
    const prompt = `
Você é um assistente de produtividade. Converta o texto do usuário em uma lista de tarefas estruturadas.

Regras:
- Responda APENAS com JSON válido, sem markdown.
- "tasks" deve ser um array.
- Cada item: { "title": string, "duration_min": number, "priority": 1|2|3, "energy": "high"|"medium"|"low" }
- duration_min: mínimo 5, múltiplos de 5, padrão 30 se não souber.
- priority: 1=alta, 2=média, 3=baixa.
- energy: high para tarefa mental pesada (criação/decisão), medium para operacional, low para fácil/rápida.
- Se o usuário pedir algo grande, quebre em 3–7 subtarefas.

Texto do usuário:
"${text.trim()}"
`.trim();

    // Gemini REST: generateContent
    // Docs: API reference + generate content
    // Auth via x-goog-api-key header
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json(
        { error: "Falha ao chamar Gemini.", details: errText },
        { status: 500 }
      );
    }

    const data = await geminiRes.json();

    // Extrai texto da resposta
    const modelText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Tenta parsear JSON “puro”
    let parsed: ParsedResponse | null = null;

    try {
      parsed = JSON.parse(modelText);
    } catch {
      // fallback: tenta extrair o primeiro bloco JSON se o modelo vier com texto extra
      const match = modelText.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (!parsed?.tasks || !Array.isArray(parsed.tasks)) {
      return NextResponse.json(
        { error: "Resposta do modelo não veio no formato esperado.", raw: modelText },
        { status: 500 }
      );
    }

    // Sanitização leve
    const tasks = parsed.tasks
      .map((t) => ({
        title: String(t.title ?? "").trim(),
        duration_min: Number(t.duration_min ?? 30),
        priority: Number(t.priority ?? 2) as 1 | 2 | 3,
        energy: (t.energy ?? "medium") as "high" | "medium" | "low",
      }))
      .filter((t) => t.title.length >= 2)
      .map((t) => ({
        ...t,
        duration_min:
          Math.max(5, Math.round(t.duration_min / 5) * 5) || 30,
        priority: ([1, 2, 3].includes(t.priority) ? t.priority : 2) as 1 | 2 | 3,
        energy: (["high", "medium", "low"].includes(t.energy) ? t.energy : "medium") as
          | "high"
          | "medium"
          | "low",
      }))
      .slice(0, 10);

    return NextResponse.json({ tasks });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Erro inesperado." },
      { status: 500 }
    );
  }
}