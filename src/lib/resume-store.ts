import type { ResumeAnalysis } from "./resume.functions";

const KEY = "matchmyresume:last";

export interface StoredRun {
  analysis: ResumeAnalysis;
  resume: string;
  job: string;
}

export function saveRun(run: StoredRun) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(run));
  } catch {
    /* ignore */
  }
}

export function loadRun(): StoredRun | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredRun) : null;
  } catch {
    return null;
  }
}
