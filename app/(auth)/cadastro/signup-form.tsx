"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Com confirmacao de e-mail ligada no Supabase, nao ha sessao imediata.
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
    } else {
      setInfo("Conta criada. Confirme o e-mail que enviamos para poder entrar.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        E-mail
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-base font-normal"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Senha
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-base font-normal"
        />
        <span className="text-xs font-normal text-muted">Mínimo de 6 caracteres.</span>
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-err-soft px-3 py-2 text-sm text-err">
          {error}
        </p>
      )}
      {info && (
        <p role="status" className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand">
          {info}
        </p>
      )}

      <Button type="submit" size="lg" disabled={loading} className="mt-1">
        {loading ? "Criando…" : "Criar conta"}
      </Button>
    </form>
  );
}
