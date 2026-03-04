"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/ToastProvider";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let alive = true;

    async function check() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!alive) return;

      if (!session) {
        toast({
          title: "Acesso restrito",
          description: "Você precisa estar logado para acessar essa página.",
          variant: "warning",
        });

        router.replace("/login");
      }
    }

    check();

    return () => {
      alive = false;
    };
  }, [router, toast]);

  return <>{children}</>;
}