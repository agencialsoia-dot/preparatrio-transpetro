"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message,
      );
      setLoading(false);
      return;
    }
    router.replace(nextPath);
    router.refresh();
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-base font-normal"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-err-soft px-3 py-2 text-sm text-err">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={loading} className="mt-1">
        {loading ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
