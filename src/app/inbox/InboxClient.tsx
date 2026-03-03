"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TaskComposer from "@/components/TaskComposer";
import TaskList from "@/components/TaskList";
import { Sparkles, Inbox as InboxIcon, Wand2 } from "lucide-react";

export default function InboxClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  const [idea, setIdea] = useState("");
  const [generating, setGenerating] = useState(false);

  const placeholderSuggestions = useMemo(
    () => [
      "Preparar apresentação para reunião de sexta",
      "Organizar rotina de treinos e dieta da semana",
      "Planejar lançamento do produto em 7 dias",
    ],
    []
  );

  async function handleGenerate() {
    if (!idea.trim()) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 700));
    setGenerating(false);
  }

  return (
    <div className="space-y-10">
      {/* HERO */}
      <div className="flex items-start justify-between gap-10">
        <div className="max-w-3xl">
          <div className="text-sm text-slate-400 flex items-center gap-2">
            <InboxIcon size={16} className="opacity-80" />
            Caixa de entrada inteligente
          </div>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-100">
            Inbox
          </h1>

          <p className="mt-3 text-base text-slate-400 leading-relaxed">
            Capture tarefas rápidas ou use a IA para transformar objetivos grandes em passos claros,
            com prioridade e energia. Sinta-se a vontade para usufruir desta sessão como preferir.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            variant="ghost"
            onClick={() =>
              document.getElementById("inbox-list")?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-6 py-3"
          >
            Ver tarefas <span className="opacity-70">↓</span>
          </Button>
        </div>
      </div>

      {/* GRID WIDE */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-10 items-start">
        {/* Coluna esquerda: IA ocupa bastante */}
        <div className="2xl:col-span-8 space-y-10">
          <Card className="p-0">
            <div className="p-10">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-300" size={18} />
                    <div className="text-2xl font-semibold text-slate-100">
                      Gerar com IA
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-slate-400 leading-relaxed max-w-2xl">
                    Descreva o que você quer fazer. Eu quebro em tarefas prontas, com prioridade e energia.
                  </div>
                </div>

                <div className="text-xs text-slate-400 whitespace-nowrap mt-2">
                  revisão antes de salvar
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">Descrição</div>

                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder={placeholderSuggestions[0]}
                    className="
                      w-full min-h-40 resize-none
                      rounded-2xl border border-white/10 bg-white/5
                      px-4 py-3 text-sm text-slate-100
                      outline-none transition
                      focus:border-purple-400/40 focus:bg-white/7
                    "
                  />

                  <div className="text-xs text-slate-400">
                    Dica: <span className="text-slate-300">“{placeholderSuggestions[1]}”</span>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!idea.trim() || generating}
                    className="w-full py-3"
                  >
                    <Wand2 size={16} />
                    {generating ? "Gerando..." : "Gerar tarefas"}
                  </Button>
                </div>

                {/* Preview grande ao lado: isso dá “respiro” */}
                <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
                  <div className="text-sm font-semibold text-slate-100">Prévia</div>
                  <div className="mt-2 text-sm text-slate-400 leading-relaxed">
                    As tarefas sugeridas aparecerão aqui para você revisar, editar e aprovar antes de salvar.
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="h-10 rounded-xl bg-white/5 border border-white/10" />
                    <div className="h-10 rounded-xl bg-white/5 border border-white/10" />
                    <div className="h-10 rounded-xl bg-white/5 border border-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna direita: Nova tarefa fixa no topo */}
        <div className="2xl:col-span-4">
          <Card className="p-0 sticky top-10">
            <div className="p-10">
              <div className="text-2xl font-semibold text-slate-100">Nova tarefa</div>
              <div className="mt-2 text-sm text-slate-400 leading-relaxed">
                Capture rápido. Você organiza com calma depois.
              </div>

              <div className="mt-6">
                <TaskComposer onCreated={() => setRefreshKey((k) => k + 1)} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* LISTA */}
      <Card className="p-0" id="inbox-list">
        <div className="p-10">
          <div className="text-2xl font-semibold text-slate-100">Tarefas na Inbox</div>
          <div className="mt-2 text-sm text-slate-400 leading-relaxed">
            Tudo que você capturou para organizar depois.
          </div>

          <div className="mt-8">
            <TaskList status="inbox" refreshKey={refreshKey} />
          </div>
        </div>
      </Card>
    </div>
  );
}