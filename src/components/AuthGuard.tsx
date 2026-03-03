"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;

      if (!hasSession) {
        router.replace("/login");
        return;
      }
      setReady(true);
    }
    check();
  }, [router]);

  if (!ready) {
    return (
      <div className="text-sm text-zinc-400">
        Carregando...
      </div>
    );
  }

  return <>{children}</>;
}