// src/app/login/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-70">
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-70">
      <path
        fill="currentColor"
        d="M12 17a2 2 0 0 0 2-2a2 2 0 1 0-2 2m6-7h-1V8a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2m-3 0H9V8a3 3 0 0 1 6 0z"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 2l7 4v6c0 5-3 9-7 10c-4-1-7-5-7-10V6l7-4m0 6a2 2 0 0 0-2 2v3H9v2h6v-2h-1v-3a2 2 0 0 0-2-2Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Bem-vindo de volta" : "Criar sua conta"),
    [mode]
  );
  const subtitle = useMemo(
    () =>
      mode === "login"
        ? "Acesse seu dashboard para continuar."
        : "Crie sua conta para começar a organizar.",
    [mode]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) return;

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          alert(error.message);
          return;
        }
        alert("Conta criada! Agora faça login.");
        setMode("login");
        setPassword("");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      alert("Digite seu email primeiro.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Te enviei um email para redefinir a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        {/* Topo simples (sem sidebar) */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">
              Organize
            </div>
            <div className="text-lg font-semibold tracking-tight">
              <span className="text-zinc-100">Organize</span>
              <span className="text-violet-300">.ia</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-zinc-500">Interface premium</span>
            <span className="h-9 w-9 rounded-2xl border border-zinc-800/70 bg-zinc-950/30 flex items-center justify-center text-violet-300">
              AI
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mt-10 grid place-items-center">
          <div className="w-full max-w-[520px]">
            <div className="relative overflow-hidden rounded-[28px] border border-zinc-800/70 bg-zinc-950/25 shadow-sm">
              {/* brilho/gradiente do card */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/25 to-transparent" />
              <div className="pointer-events-none absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-500/15 to-transparent" />

              <div className="relative p-6 sm:p-8">
                {/* Ícone topo */}
                <div className="flex justify-center">
                  <div className="h-14 w-14 rounded-2xl border border-violet-500/25 bg-violet-500/10 flex items-center justify-center text-violet-200">
                    <IconShield />
                  </div>
                </div>

                <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight text-zinc-100">
                  {title}
                </h1>
                <p className="mt-2 text-center text-sm text-zinc-400">
                  {subtitle}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
                  <label className="grid gap-2">
                    <span className="text-xs text-zinc-500">Email</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-950/35 px-4 py-3 focus-within:border-violet-500/40">
                      <span className="text-zinc-400">
                        <IconMail />
                      </span>
                      <input
                        className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600"
                        placeholder="seu@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs text-zinc-500">Senha</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-950/35 px-4 py-3 focus-within:border-violet-500/40">
                      <span className="text-zinc-400">
                        <IconLock />
                      </span>
                      <input
                        className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600"
                        placeholder="Senha secreta"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                      />
                    </div>
                  </label>

                  {/* Ações secundárias */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={loading}
                      className="text-xs text-zinc-400 hover:text-zinc-200 transition"
                    >
                      Esqueceu a senha?
                    </button>

                    <span className="text-xs text-zinc-600">
                      {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
                      <button
                        type="button"
                        onClick={() =>
                          setMode(mode === "login" ? "signup" : "login")
                        }
                        disabled={loading}
                        className="text-violet-300 hover:text-violet-200 transition font-medium"
                      >
                        {mode === "login" ? "Cadastre-se" : "Entrar"}
                      </button>
                    </span>
                  </div>

                  {/* Botão principal */}
                  <button
                    disabled={loading}
                    className={[
                      "mt-2 w-full rounded-2xl py-3 font-medium text-zinc-100 transition",
                      "border border-violet-500/30 bg-violet-500/15 hover:bg-violet-500/20",
                      "shadow-sm",
                      loading ? "opacity-70 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {loading
                      ? "Processando..."
                      : mode === "login"
                      ? "Entrar na Plataforma →"
                      : "Criar conta →"}
                  </button>

                  {/* Rodapé do card */}
                  <div className="mt-3 text-center text-xs text-zinc-500">
                    Ao continuar, você concorda em usar o app com segurança.
                  </div>
                </form>
              </div>
            </div>

            {/* nota embaixo */}
            <div className="mt-4 text-center text-xs text-zinc-500">
              Dica: use uma senha forte e não compartilhe seus dados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}