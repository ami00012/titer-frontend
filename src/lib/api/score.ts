import { apiFetch, ApiError } from "@/lib/api/client";

export interface Finding {
  span: [number, number];
  ruleId: string;
  severity: "low" | "medium" | "high" | string;
  explanation: string;
  suggestion: string;
}

export interface XMeasurement {
  input: string;
  titer: number;
  band: string;
  confidence: "calibrated" | "adhoc";
  interpretation: string;
  findings: Finding[];
}

export interface ParagraphScore {
  index: number;
  span: [number, number];
  titer: number;
  band: string;
  findingCount: number;
  insufficientLength: boolean;
}

export interface ScoreResponse {
  id: string;
  titer: number;
  verdict: string;
  subscores: Record<string, number>;
  findings: Finding[];
  wordCount: number;
  createdAt: string;
  x: XMeasurement | null;
  /** Rules-layer-only per-paragraph breakdown; empty below 3 scorable paragraphs or on a re-fetched past scan. */
  paragraphs: ParagraphScore[];
}

export interface UnmeasurableXError {
  reason: string;
  suggestions: string[];
}

/** True when `error` is the 422 unmeasurable_x envelope from POST /v1/score. */
export function isUnmeasurableX(error: unknown): error is ApiError & { body: { error: { detail: UnmeasurableXError } } } {
  if (!(error instanceof ApiError) || error.status !== 422) return false;
  const body = error.body as { error?: { code?: string } } | undefined;
  return body?.error?.code === "unmeasurable_x";
}

/**
 * "text" doubles as a URL input -- the backend's ContentSourceRegistry
 * classifies a string starting with http(s):// as a URL and fetches/extracts
 * the article instead of scoring the literal string. Same endpoint, same
 * response shape, no separate URL-scoring call needed.
 */
export function scoreText(text: string, x?: string) {
  return apiFetch<ScoreResponse>("/v1/score", {
    method: "POST",
    body: JSON.stringify(x ? { text, x } : { text }),
  });
}

/**
 * Video upload -> local transcription (ffmpeg + Vosk, no external API) ->
 * scoring. Same "measure X" contract as scoreText: omit x for the flagship
 * dimension only, or pass one for the dual-dimension flow (library or ad-hoc synthesized,
 * same XResolver path text/URL scans go through). Goes through
 * POST /v1/score/upload (multipart, since a File can't ride a JSON body) but
 * returns the identical ScoreResponse shape, so the UI needs no separate renderer.
 */
export function scoreVideo(file: File, x?: string) {
  const form = new FormData();
  form.append("file", file);
  if (x) form.append("x", x);

  return apiFetch<ScoreResponse>("/v1/score/upload", {
    method: "POST",
    body: form,
  });
}
