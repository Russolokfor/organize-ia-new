"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const userEmail = data.session?.user?.email ?? null;
      if (mounted) setEmail(userEmail);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!email) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-600 hidden sm:inline">{email}</span>
      <button
        onClick={logout}
        className="text-sm border rounded-lg px-3 py-2 hover:bg-zinc-50"
      >
        Sair
      </button>
    </div>
  );
}