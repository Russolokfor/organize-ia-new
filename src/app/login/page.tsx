"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "signup") {
      await supabase.auth.signUp({ email, password });
      alert("Conta criada! Agora faça login.");
      setMode("login");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push("/");
    }
  }

  return (
    <div className="max-w-md mx-auto border rounded-2xl p-6 shadow-sm">
      <h1 className="text-lg font-semibold">Login — Organize.ia</h1>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-black text-white rounded-xl py-2">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          onClick={() =>
            setMode(mode === "login" ? "signup" : "login")
          }
          className="w-full border rounded-xl py-2"
        >
          {mode === "login"
            ? "Criar conta"
            : "Já tenho conta"}
        </button>
      </form>
    </div>
  );
}