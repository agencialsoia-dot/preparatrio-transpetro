export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Preparatório Transpetro</h1>
          <p className="mt-1 text-sm text-muted">Dutos e Terminais · Cesgranrio · 29/11/2026</p>
        </div>
        {children}
      </div>
    </main>
  );
}
