"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Energy = "high" | "medium" | "low";

type Preferences = {
  user_id: string;
  wake_time: string;   // "07:00:00" ou "07:00"
  sleep_time: string;
  focus_start: string | null;
  focus_end: string | null;
  morning_energy: Energy;
  afternoon_energy: Energy;
  night_energy: Energy;
  daily_work_minutes: number;
};

type Block = {
  id: string;
  title: string;
  day_of_week: number; // 0..6
  start_time: string;
  end_time: string;
  kind: "busy" | "free";
};

const DOW = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

function energyLabel(e: Energy) {
  if (e === "high") return "Alta";
  if (e === "medium") return "Média";
  return "Baixa";
}

function normalizeTime(t: string | null | undefined) {
  if (!t) return "";
  return t.slice(0, 5); // "HH:MM"
}

export default function RoutineClient() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  // form states (prefs)
  const [wake, setWake] = useState("07:00");
  const [sleep, setSleep] = useState("23:00");
  const [focusStart, setFocusStart] = useState("");
  const [focusEnd, setFocusEnd] = useState("");
  const [mEnergy, setMEnergy] = useState<Energy>("high");
  const [aEnergy, setAEnergy] = useState<Energy>("medium");
  const [nEnergy, setNEnergy] = useState<Energy>("low");
  const [dailyMinutes, setDailyMinutes] = useState(240);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // form states (block)
  const [bTitle, setBTitle] = useState("");
  const [bDay, setBDay] = useState(1);
  const [bStart, setBStart] = useState("09:00");
  const [bEnd, setBEnd] = useState("10:00");
  const [bKind, setBKind] = useState<"busy" | "free">("busy");
  const [savingBlock, setSavingBlock] = useState(false);

  async function loadAll() {
    setLoading(true);

    const sessionRes = await supabase.auth.getSession();
    const user = sessionRes.data.session?.user;
    if (!user) {
      setLoading(false);
      return;
    }

    const prefsRes = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (prefsRes.error) alert(prefsRes.error.message);

    const blocksRes = await supabase
      .from("routine_blocks")
      .select("id,title,day_of_week,start_time,end_time,kind")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (blocksRes.error) alert(blocksRes.error.message);

    const p = prefsRes.data as Preferences | null;
    setPrefs(p);

    // hydrate form defaults
    if (p) {
      setWake(normalizeTime(p.wake_time) || "07:00");
      setSleep(normalizeTime(p.sleep_time) || "23:00");
      setFocusStart(normalizeTime(p.focus_start));
      setFocusEnd(normalizeTime(p.focus_end));
      setMEnergy(p.morning_energy);
      setAEnergy(p.afternoon_energy);
      setNEnergy(p.night_energy);
      setDailyMinutes(p.daily_work_minutes ?? 240);
    }

    setBlocks((blocksRes.data as Block[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function savePreferences(e: React.FormEvent) {
    e.preventDefault();
    setSavingPrefs(true);

    try {
      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;
      if (!user) throw new Error("Você precisa estar logado.");

      // foco é opcional: se um estiver vazio, salva null nos dois
      const focusOk = focusStart && focusEnd;
      const payload = {
        user_id: user.id,
        wake_time: wake,
        sleep_time: sleep,
        focus_start: focusOk ? focusStart : null,
        focus_end: focusOk ? focusEnd : null,
        morning_energy: mEnergy,
        afternoon_energy: aEnergy,
        night_energy: nEnergy,
        daily_work_minutes: Number(dailyMinutes),
      };

      const { error } = await supabase.from("user_preferences").upsert(payload);
      if (error) throw error;

      await loadAll();
      alert("Preferências salvas ✅");
    } catch (err: any) {
      alert(err.message ?? "Erro ao salvar preferências.");
    } finally {
      setSavingPrefs(false);
    }
  }

  function timeToMinutes(t: string) {
    const [hh, mm] = t.split(":").map(Number);
    return hh * 60 + mm;
  }

  async function addBlock(e: React.FormEvent) {
    e.preventDefault();
    setSavingBlock(true);

    try {
      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;
      if (!user) throw new Error("Você precisa estar logado.");

      if (!bTitle.trim()) throw new Error("Dê um nome para o bloco.");
      if (timeToMinutes(bEnd) <= timeToMinutes(bStart)) {
        throw new Error("O fim precisa ser depois do início.");
      }

      const { error } = await supabase.from("routine_blocks").insert({
        user_id: user.id,
        title: bTitle.trim(),
        day_of_week: bDay,
        start_time: bStart,
        end_time: bEnd,
        kind: bKind,
      });

      if (error) throw error;

      setBTitle("");
      await loadAll();
    } catch (err: any) {
      alert(err.message ?? "Erro ao criar bloco.");
    } finally {
      setSavingBlock(false);
    }
  }

  async function removeBlock(id: string) {
    const ok = confirm("Excluir este bloco?");
    if (!ok) return;

    const { error } = await supabase.from("routine_blocks").delete().eq("id", id);
    if (error) alert(error.message);
    await loadAll();
  }

  if (loading) return <p className="text-sm text-zinc-500">Carregando…</p>;

  return (
    <div className="grid gap-4">
      <div className="border rounded-2xl p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Rotina</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Defina horários do seu dia + energia (manhã/tarde/noite) e adicione blocos fixos.
        </p>
      </div>

      {/* Preferências */}
      <form onSubmit={savePreferences} className="border rounded-2xl p-6 shadow-sm grid gap-4">
        <div>
          <h2 className="font-semibold">Preferências do dia</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Isso guia o planejamento automático (limite diário, foco e energia).
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="text-zinc-500">Acordo</span>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={wake}
              onChange={(e) => setWake(e.target.value)}
              required
            />
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Durmo</span>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              required
            />
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Foco começa (opcional)</span>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={focusStart}
              onChange={(e) => setFocusStart(e.target.value)}
            />
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Foco termina (opcional)</span>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={focusEnd}
              onChange={(e) => setFocusEnd(e.target.value)}
            />
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Energia manhã</span>
            <select
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={mEnergy}
              onChange={(e) => setMEnergy(e.target.value as Energy)}
            >
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Energia tarde</span>
            <select
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={aEnergy}
              onChange={(e) => setAEnergy(e.target.value as Energy)}
            >
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Energia noite</span>
            <select
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={nEnergy}
              onChange={(e) => setNEnergy(e.target.value as Energy)}
            >
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Limite diário (min)</span>
            <input
              type="number"
              min={30}
              step={15}
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
            />
            <div className="text-xs text-zinc-500 mt-1">
              Sugestão: 240 = 4h/dia de tarefas planejadas.
            </div>
          </label>
        </div>

        <button
          disabled={savingPrefs}
          className="bg-black text-white rounded-xl px-4 py-2 disabled:opacity-60"
        >
          {savingPrefs ? "Salvando..." : "Salvar preferências"}
        </button>
      </form>

      {/* Blocos fixos */}
      <div className="border rounded-2xl p-6 shadow-sm grid gap-4">
        <div>
          <h2 className="font-semibold">Blocos fixos</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Ex.: Trabalho, almoço, academia… (um dia da semana por bloco).
          </p>
        </div>

        <form onSubmit={addBlock} className="grid sm:grid-cols-5 gap-2 items-end">
          <label className="text-sm sm:col-span-2">
            <span className="text-zinc-500">Título</span>
            <input
              className="w-full border rounded-xl px-3 py-2 mt-1"
              placeholder="Ex: Trabalho"
              value={bTitle}
              onChange={(e) => setBTitle(e.target.value)}
              required
            />
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Dia</span>
            <select
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={bDay}
              onChange={(e) => setBDay(Number(e.target.value))}
            >
              {DOW.map((d, idx) => (
                <option key={idx} value={idx}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Início</span>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={bStart}
              onChange={(e) => setBStart(e.target.value)}
              required
            />
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Fim</span>
            <input
              type="time"
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={bEnd}
              onChange={(e) => setBEnd(e.target.value)}
              required
            />
          </label>

          <label className="text-sm">
            <span className="text-zinc-500">Tipo</span>
            <select
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={bKind}
              onChange={(e) => setBKind(e.target.value as "busy" | "free")}
            >
              <option value="busy">Ocupado</option>
              <option value="free">Livre</option>
            </select>
            <div className="text-xs text-zinc-500 mt-1">
              (por enquanto use “Ocupado”)
            </div>
          </label>

          <button
            disabled={savingBlock}
            className="sm:col-span-5 bg-black text-white rounded-xl px-4 py-2 disabled:opacity-60"
          >
            {savingBlock ? "Adicionando..." : "Adicionar bloco"}
          </button>
        </form>

        <div className="mt-2 grid gap-2">
          {blocks.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum bloco fixo ainda.</p>
          ) : (
            blocks.map((b) => (
              <div key={b.id} className="flex items-center justify-between border rounded-xl p-3">
                <div className="min-w-0">
                  <div className="truncate">{b.title}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {DOW[b.day_of_week]} • {normalizeTime(b.start_time)}–{normalizeTime(b.end_time)} •{" "}
                    {b.kind === "busy" ? "Ocupado" : "Livre"}
                  </div>
                </div>

                <button
                  onClick={() => removeBlock(b.id)}
                  className="text-sm border rounded-lg px-3 py-2 hover:bg-zinc-50"
                >
                  Excluir
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mini resumo útil */}
      <div className="border rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold">Resumo</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Manhã: {energyLabel(mEnergy)} • Tarde: {energyLabel(aEnergy)} • Noite: {energyLabel(nEnergy)} • Limite:{" "}
          {dailyMinutes} min/dia
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          Próximo passo: fazer o “Organizar meu dia” respeitar esses blocos e gerar horários reais.
        </p>
      </div>
    </div>
  );
}