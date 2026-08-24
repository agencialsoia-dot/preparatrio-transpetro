import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  const { proximo } = await searchParams;
  return (
    <Card>
      <CardContent className="pt-5">
        <LoginForm nextPath={proximo ?? "/dashboard"} />
        <p className="mt-4 text-center text-sm text-muted">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-brand hover:underline">
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
