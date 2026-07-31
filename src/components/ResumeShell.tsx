import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function ResumeShell({ children }: { children: ReactNode }) {
  return (
    <div className="mmr min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/match" className="text-base font-semibold tracking-tight">
            Match<span className="text-primary">MyResume</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/match" className="transition-colors hover:text-foreground">
              Analyse
            </Link>
            <Link to="/match-results" className="transition-colors hover:text-foreground">
              Results
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-10">{children}</main>
    </div>
  );
}
