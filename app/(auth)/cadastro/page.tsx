import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export default function CadastroPage() {
  return (
    <Card>
      <CardContent className="pt-5">
        <SignupForm />
        <p className="mt-4 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
