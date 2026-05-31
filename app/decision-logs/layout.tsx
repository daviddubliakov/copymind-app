import Link from "next/link";
import { Suspense } from "react";

import { AuthControlsSkeleton } from "@/components/decision-log-skeletons";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";

export default function DecisionLogsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/decision-logs/new">COPYMND test</Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense fallback={<AuthControlsSkeleton />}>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>

        <div className="flex-1 w-full p-5">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>

        <footer className="w-full border-t border-border/60">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:flex-row sm:text-left">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Crafted with care</p>
              <p className="text-xs text-muted-foreground">Done by Davyd Dubliakov</p>
            </div>
            <ThemeSwitcher />
          </div>
        </footer>
      </div>
    </main>
  );
}
