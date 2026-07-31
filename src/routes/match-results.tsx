import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, Minus, X } from "lucide-react";
import { ResumeShell } from "@/components/ResumeShell";
import { loadRun, type StoredRun } from "@/lib/resume-store";

export const Route = createFileRoute("/match-results")({
  head: () => ({
    meta: [
      { title: "Your Match Results — MatchMyResume" },
      {
        name: "description",
        content:
          "Your resume match score, skills comparison table, missing keywords, before/after bullet rewrites and a tailored cover letter.",
      },
      { property: "og:title", content: "Your Match Results — MatchMyResume" },
      {
        property: "og:description",
        content:
          "Match score, skills gap, missing keywords, rewritten bullets and a cover letter for your target role.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const [run, setRun] = useState<StoredRun | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRun(loadRun());
    setReady(true);
  }, []);

  if (!ready) return <ResumeShell>{null}</ResumeShell>;

  if (!run) {
    return (
      <ResumeShell>
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <h1 className="text-xl font-semibold">No analysis yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste a resume and a job description to see your match score.
          </p>
          <Link
            to="/match"
            className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Start an analysis
          </Link>
        </div>
      </ResumeShell>
    );
  }

  const a = run.analysis;

  return (
    <ResumeShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Your match results</h1>
        <Link
          to="/match"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Run a new analysis
        </Link>
      </div>

      <section className="mt-6 flex flex-col items-center gap-6 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center">
        <Dial score={a.score} />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Match score
          </h2>
          <p className="mt-2 text-sm leading-relaxed">{a.summary}</p>
        </div>
      </section>

      {a.skills.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Skills comparison</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Skill</th>
                  <th className="px-4 py-3 font-medium">In job</th>
                  <th className="px-4 py-3 font-medium">In resume</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {a.skills.map((s, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{s.skill}</td>
                    <td className="px-4 py-3">
                      <Mark on={s.inJob} />
                    </td>
                    <td className="px-4 py-3">
                      <Mark on={s.inResume} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {a.missingKeywords.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Missing keywords</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These appear in the job description but not clearly in your resume.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {a.missingKeywords.map((k) => (
              <li
                key={k}
                className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
              >
                {k}
              </li>
            ))}
          </ul>
        </section>
      )}

      {a.bullets.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Bullet rewrites</h2>
          <div className="mt-3 space-y-3">
            {a.bullets.map((b, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-2"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Before
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.before}</p>
                </div>
                <div className="md:border-l md:border-border md:pl-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    After
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{b.after}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {a.coverLetter && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Cover letter</h2>
            <CopyButton text={a.coverLetter} />
          </div>
          <div className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-card p-5 text-sm leading-relaxed">
            {a.coverLetter}
          </div>
        </section>
      )}
    </ResumeShell>
  );
}

function Mark({ on }: { on: boolean }) {
  return on ? (
    <span className="inline-flex items-center gap-1 text-primary">
      <Check className="h-4 w-4" aria-hidden />
      <span className="sr-only">Yes</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Minus className="h-4 w-4" aria-hidden />
      <span className="sr-only">No</span>
    </span>
  );
}

function Dial({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShown(score), 80);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-secondary"
        />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-1000 ease-out"
          strokeDasharray={c}
          strokeDashoffset={c - (c * shown) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tracking-tight">{score}</span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
    >
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export { X };
