import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Loader2, ScanSearch } from "lucide-react";
import { ResumeShell } from "@/components/ResumeShell";
import { analyzeResume } from "@/lib/resume.functions";
import { saveRun } from "@/lib/resume-store";

export const Route = createFileRoute("/match")({
  head: () => ({
    meta: [
      { title: "MatchMyResume — Score Your Resume Against Any Job" },
      {
        name: "description",
        content:
          "Paste your resume and a job description to get an instant match score, skills gap table, missing keywords, rewritten bullets and a tailored cover letter.",
      },
      { property: "og:title", content: "MatchMyResume — Score Your Resume Against Any Job" },
      {
        property: "og:description",
        content:
          "Instant resume-to-job match score, skills gap analysis, missing keywords and an AI-written cover letter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatchPage,
});

function MatchPage() {
  const navigate = useNavigate();
  const run = useServerFn(analyzeResume);
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!resume.trim() || !job.trim()) {
      setError("Paste both your resume and the job description first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const analysis = await run({ data: { resume: resume.trim(), job: job.trim() } });
      saveRun({ analysis, resume: resume.trim(), job: job.trim() });
      navigate({ to: "/match-results" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResumeShell>
      <h1 className="text-3xl font-semibold tracking-tight">
        See how well your resume fits the job
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Paste your resume on the left and the job description on the right. You&apos;ll get a match
        score, a skills comparison, missing keywords, sharper bullets and a ready-to-send cover
        letter.
      </p>

      <form onSubmit={submit} className="mt-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Resume"
            hint="Plain text works best"
            value={resume}
            onChange={setResume}
            placeholder="Paste your full resume here…"
            disabled={loading}
          />
          <Field
            label="Job description"
            hint="Include requirements and responsibilities"
            value={job}
            onChange={setJob}
            placeholder="Paste the job posting here…"
            disabled={loading}
          />
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanSearch className="h-4 w-4" />
            )}
            {loading ? "Analysing…" : "Analyse"}
          </button>
          {loading && (
            <span className="text-sm text-muted-foreground">
              Reading both documents and scoring the match…
            </span>
          )}
        </div>
      </form>
    </ResumeShell>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium" htmlFor={label}>
          {label}
        </label>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <textarea
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={16}
        className="mt-3 w-full resize-y rounded-md border border-border bg-background p-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60"
      />
    </div>
  );
}
