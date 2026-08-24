"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { iniciarSimulado } from "./actions";

export function StartButton({ examId, disabled }: { examId: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button disabled={disabled || pending} onClick={() => start(() => iniciarSimulado(examId))}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {disabled ? "Sem questões" : "Fazer prova"}
    </Button>
  );
}
