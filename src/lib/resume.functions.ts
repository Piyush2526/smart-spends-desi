import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chat, stripFences } from "./ai.server";

export interface SkillRow {
  skill: string;
  inJob: boolean;
  inResume: boolean;
  note: string | null;
}

export interface BulletRewrite {
  before: string;
  after: string;
}

export interface ResumeAnalysis {
  score: number;
  summary: string;
  skills: SkillRow[];
  missingKeywords: string[];
  bullets: BulletRewrite[];
  coverLetter: string;
}

const SYSTEM = `You are an expert technical recruiter and resume editor. You compare a candidate's resume against a job description and return ONLY valid JSON — no markdown, no code fences, no commentary.

OUTPUT FORMAT (exact keys):
{
  "score": <integer 0-100, how well the resume matches the job>,
  "summary": "<one or two sentences explaining the score>",
  "skills": [ { "skill": "<skill name>", "inJob": <true|false>, "inResume": <true|false>, "note": "<short remark or null>" } ],
  "missingKeywords": [ "<keyword from the job description absent or weak in the resume>" ],
  "bullets": [ { "before": "<a real bullet copied from the resume>", "after": "<rewritten, quantified, job-aligned version>" } ],
  "coverLetter": "<a concise, specific cover letter, 150-220 words, plain text with paragraph breaks, no placeholders like [Company] unless the job description omits the name>"
}

RULES:
- Include 8-12 rows in "skills", covering the most important requirements of the job plus notable resume strengths.
- Include 5-10 "missingKeywords" (fewer if the resume genuinely covers everything).
- Include 3-5 "bullets". "before" must be text that actually appears in the resume.
- Never invent experience the candidate does not have; rewrites may sharpen wording and add measurable framing only where the resume implies it.
- If either input is empty or unusable, return score 0, an explanatory summary, and empty arrays with an empty coverLetter.`;

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        resume: z.string().min(1),
        job: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<ResumeAnalysis> => {
    const raw = await chat([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `RESUME:\n${data.resume}\n\n---\n\nJOB DESCRIPTION:\n${data.job}`,
      },
    ]);

    let parsed: Partial<ResumeAnalysis>;
    try {
      parsed = JSON.parse(stripFences(raw)) as Partial<ResumeAnalysis>;
    } catch {
      throw new Error("The analysis came back unreadable. Please try again.");
    }

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    return {
      score,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      skills: Array.isArray(parsed.skills)
        ? parsed.skills.map((s) => ({
            skill: String(s?.skill ?? ""),
            inJob: Boolean(s?.inJob),
            inResume: Boolean(s?.inResume),
            note: typeof s?.note === "string" ? s.note : null,
          }))
        : [],
      missingKeywords: Array.isArray(parsed.missingKeywords)
        ? parsed.missingKeywords.map((k) => String(k)).filter(Boolean)
        : [],
      bullets: Array.isArray(parsed.bullets)
        ? parsed.bullets.map((b) => ({
            before: String(b?.before ?? ""),
            after: String(b?.after ?? ""),
          }))
        : [],
      coverLetter: typeof parsed.coverLetter === "string" ? parsed.coverLetter : "",
    };
  });
