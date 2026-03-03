"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function UserMenu() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <button
      onClick={logout}
      className="px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
    >
      Sair
    </button>
  );
}