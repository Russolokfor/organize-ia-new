"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  onCreated?: () => void;
};

export default function TaskComposer({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [durationMin, setDurationMin] = useState<number>(30);
  const [priority, setPriority] = useState<number>(2);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleCreate() {
    setErrorMsg(null);

    const trimmed = title.trim();
    if (!trimmed) {
      setErrorMsg("Digite um título.");
      return;
    }

    setSaving(true);

    const sessionRes = await supabase.auth.getSession();
    const user = sessionRes.data.session?.user;

    if (!user) {
      setSaving(false);
      setErrorMsg("Você precisa estar logado.");
      return;
    }

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: trimmed,
      status: "inbox",
      duration_min: durationMin,
      priority,
      energy: "medium",
    });

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setTitle("");
    setDurationMin(30);
    setPriority(2);

    // ✅ avisa a tela (InboxClient) para atualizar lista
    onCreated?.();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="font-semibold">Nova tarefa</div>

      <input
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-purple-400/40"
        placeholder="Ex: Responder clientes"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="flex gap-2">
        <input
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-purple-400/40"
          type="number"
          min={5}
          step={5}
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value))}
        />
        <input
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-purple-400/40"
          type="number"
          min={1}
          max={5}
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        />
      </div>

      {errorMsg && <div className="text-sm text-red-400">{errorMsg}</div>}

      <button
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
        onClick={handleCreate}
        disabled={saving}
      >
        {saving ? "Salvando..." : "Criar tarefa"}
      </button>
    </div>
  );
}