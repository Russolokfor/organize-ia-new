"use client";

import { useMemo, useState } from "react";
import TaskComposer from "@/components/TaskComposer";
import TaskList from "@/components/TaskList";
import { supabase } from "@/lib/supabaseClient";

type Energy = "high" | "medium" | "low";

type AiTask = {
  title: string;
  duration_min: number;
  priority: 1 | 2 | 3;
  energy: Energy;
};

function energyLabel(e: Energy) {
  if (e === "high") return "Alta";
  if (e === "medium") return "Média";
  return "Baixa";
}

export default function InboxClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AiTask[] | null>(null);
  const [savingPreview, setSavingPreview] = useState(false);

  const canGenerate = useMemo(() => aiText.trim().length >= 3, [aiText]);

  async function generateWithAI() {
    setAiError(null);
    setAiLoading(true);
    setPreview(null);

    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Falha ao gerar com IA.");

      const tasks = (data?.tasks ?? []) as AiTask[];
      if (!Array.isArray(tasks) || tasks.length === 0) {
        throw new Error("A IA não retornou tarefas. Tente descrever melhor.");
      }

      const clean = tasks
        .map((t) => ({
          title: String(t.title ?? "").trim(),
          duration_min: Math.max(5, Math.round(Number(t.duration_min ?? 30) / 5) * 5),
          priority: ([1, 2, 3].includes(Number(t.priority)) ? Number(t.priority) : 2) as 1 | 2 | 3,
          energy: (["high", "medium", "low"].includes(String(t.energy)) ? t.energy : "medium") as Energy,
        }))
        .filter((t) => t.title.length >= 2)
        .slice(0, 10);

      setPreview(clean);
    } catch (e: any) {
      setAiError(e?.message ?? "Erro ao gerar com IA.");
    } finally {
      setAiLoading(false);
    }
  }

  function updatePreview(index: number, patch: Partial<AiTask>) {
    setPreview((prev) => {
      if (!prev) return prev;
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  }

  function removeFromPreview(index: number) {
    setPreview((prev) => {
      if (!prev) return prev;
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }

  async function savePreviewToInbox() {
    if (!preview || preview.length === 0) return;

    setSavingPreview(true);
    setAiError(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;
      if (!user) throw new Error("Você precisa estar logado.");

      const payload = preview.map((t) => ({
        user_id: user.id,
        title: t.title,
        status: "inbox",
        duration_min: t.duration_min,
        priority: t.priority,
        energy: t.energy,
      }));

      const { error } = await supabase.from("tasks").insert(payload);
      if (error) throw error;

      setPreview(null);
      setAiText("");
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setAiError(e?.message ?? "Erro ao salvar tarefas.");
    } finally {
      setSavingPreview(false);
    }
  }

  return (
    <div className="grid gap-6">

      {/* Header */}
      <div className="oi-card p-6 oi-animate-in">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Inbox
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Capture tarefas manualmente ou use IA para dividir algo grande em partes executáveis.
        </p>
      </div>

      {/* IA */}
      <div className="oi-card p-6 grid gap-4 oi-animate-in">
        <div>
          <h2 className="font-semibold text-zinc-100">
            Gerar com IA (revisão antes de salvar)
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Descreva algo grande e a IA sugerirá tarefas estruturadas.
          </p>
        </div>

        <textarea
          className="oi-textarea w-full rounded-xl px-4 py-3 min-h-[100px]"
          placeholder='Ex: "Preparar apresentação para reunião de sexta"'
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={generateWithAI}
            disabled={!canGenerate || aiLoading}
            className="oi-btn bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 disabled:opacity-50"
          >
            {aiLoading ? "Gerando..." : "Gerar tarefas"}
          </button>

          {preview && (
            <button
              onClick={() => setPreview(null)}
              className="oi-btn border border-zinc-700 rounded-xl px-5 py-2 hover:bg-zinc-800"
            >
              Cancelar
            </button>
          )}
        </div>

        {aiError && (
          <div className="text-sm text-red-400">{aiError}</div>
        )}

        {preview && (
          <div className="grid gap-3 mt-3">
            <div className="text-sm text-zinc-400">
              Revise antes de salvar:
            </div>

            {preview.map((t, idx) => (
              <div key={idx} className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/40 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <input
                    className="oi-input w-full rounded-lg px-3 py-2"
                    value={t.title}
                    onChange={(e) => updatePreview(idx, { title: e.target.value })}
                  />
                  <button
                    onClick={() => removeFromPreview(idx)}
                    className="oi-btn text-sm border border-zinc-700 rounded-lg px-3 py-2 hover:bg-zinc-800"
                  >
                    Remover
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 mt-3">
                  <input
                    type="number"
                    className="oi-input rounded-lg px-3 py-2"
                    value={t.duration_min}
                    onChange={(e) =>
                      updatePreview(idx, { duration_min: Number(e.target.value) })
                    }
                  />

                  <select
                    className="oi-select rounded-lg px-3 py-2"
                    value={t.priority}
                    onChange={(e) =>
                      updatePreview(idx, { priority: Number(e.target.value) as 1 | 2 | 3 })
                    }
                  >
                    <option value={1}>Alta</option>
                    <option value={2}>Média</option>
                    <option value={3}>Baixa</option>
                  </select>

                  <select
                    className="oi-select rounded-lg px-3 py-2"
                    value={t.energy}
                    onChange={(e) =>
                      updatePreview(idx, { energy: e.target.value as Energy })
                    }
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>

                <div className="text-xs text-zinc-500 mt-2">
                  Energia atual: {energyLabel(t.energy)}
                </div>
              </div>
            ))}

            <button
              onClick={savePreviewToInbox}
              disabled={savingPreview}
              className="oi-btn bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-2 mt-2 disabled:opacity-50"
            >
              {savingPreview ? "Salvando..." : "Salvar no Inbox"}
            </button>
          </div>
        )}
      </div>

      <TaskComposer onCreated={() => setRefreshKey((k) => k + 1)} />

      <div className="oi-card p-6 oi-animate-in">
        <TaskList refreshKey={refreshKey} />
      </div>
    </div>
  );
}