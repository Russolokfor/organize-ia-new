"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TaskComposer({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [priority, setPriority] = useState(2);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) throw new Error("Você precisa estar logado.");

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title,
        status: "inbox",
        duration_min: durationMin,
        priority,
      });

      if (error) throw error;

      setTitle("");
      setDurationMin(30);
      setPriority(2);
      onCreated();
    } catch (err: any) {
      alert(err.message ?? "Erro ao criar tarefa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="border rounded-2xl p-4 shadow-sm">
      <input
        className="w-full border rounded-xl px-3 py-2"
        placeholder="Digite uma tarefa... (ex: Pagar contas)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-2 mt-3">
        <label className="text-sm">
          <span className="text-zinc-500">Duração (min)</span>
          <input
            className="w-full border rounded-xl px-3 py-2 mt-1"
            type="number"
            min={5}
            step={5}
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
          />
        </label>

        <label className="text-sm">
          <span className="text-zinc-500">Prioridade</span>
          <select
            className="w-full border rounded-xl px-3 py-2 mt-1"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          >
            <option value={1}>Alta</option>
            <option value={2}>Média</option>
            <option value={3}>Baixa</option>
          </select>
        </label>
      </div>

      <button
        className="mt-3 w-full bg-black text-white rounded-xl py-2 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Salvando..." : "Adicionar tarefa"}
      </button>
    </form>
  );
}