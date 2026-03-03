"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type RoutineBlock = {
  id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  kind: string;
};

export default function RoutineClient() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<RoutineBlock[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;

      if (!user) {
        if (!cancelled) {
          setErrorMsg("Você precisa estar logado para ver a Rotina.");
          setLoading(false);
        }
        return;
      }

      const res = await supabase
        .from("routine_blocks")
        .select("id,title,day_of_week,start_time,end_time,kind")
        .eq("user_id", user.id)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (res.error) {
        if (!cancelled) {
          setErrorMsg(res.error.message);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setBlocks((res.data ?? []) as RoutineBlock[]);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="p-6">Carregando...</div>;

  if (errorMsg) {
    return (
      <div className="p-6">
        <div className="rounded-xl border p-4">
          <div className="font-semibold">Erro</div>
          <div className="mt-2 text-sm opacity-80">{errorMsg}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Rotina</h1>

      <div className="rounded-xl border p-4 space-y-2">
        {blocks.length === 0 ? (
          <div className="text-sm opacity-70">Você ainda não cadastrou blocos.</div>
        ) : (
          blocks.map((b) => (
            <div key={b.id} className="flex items-center justify-between text-sm">
              <div className="font-medium">{b.title}</div>
              <div className="opacity-70">
                D{b.day_of_week} • {b.start_time} - {b.end_time} • {b.kind}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}