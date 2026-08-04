import { apiFetch } from "@/lib/api/client";

/** CLAUDE is the only engine with a real, working integration today -- see VisibilityService's own javadoc for why ChatGPT/Perplexity/Gemini/Google AI Overviews aren't wired up yet. */
export type AiEngine = "CLAUDE" | "CHATGPT" | "PERPLEXITY" | "GEMINI";

export interface Brand {
  id: string;
  name: string;
  domain: string;
  competitors: string[];
  createdAt: string;
  queryCount: number;
}

export interface VisibilityRun {
  id: string;
  engine: AiEngine;
  mentioned: boolean;
  cited: boolean;
  position: number | null;
  sentiment: "positive" | "neutral" | "negative" | string;
  accuracyFlags: string[];
  rawAnswer: string;
  runAt: string;
}

export interface BrandQuery {
  id: string;
  text: string;
  intent: string | null;
  active: boolean;
  /** Null until the query has been run at least once. */
  latestRun: VisibilityRun | null;
}

export function createBrand(name: string, domain: string, competitors?: string[]) {
  return apiFetch<Brand>("/v1/visibility/brands", {
    method: "POST",
    body: JSON.stringify({ name, domain, competitors: competitors?.length ? competitors : undefined }),
  });
}

export function listBrands() {
  return apiFetch<Brand[]>("/v1/visibility/brands");
}

export function addQuery(brandId: string, text: string, intent?: string) {
  return apiFetch<BrandQuery>(`/v1/visibility/brands/${brandId}/queries`, {
    method: "POST",
    body: JSON.stringify({ text, intent: intent || undefined }),
  });
}

export function listQueries(brandId: string) {
  return apiFetch<BrandQuery[]>(`/v1/visibility/brands/${brandId}/queries`);
}

/** Runs every active query for this brand against Claude right now (synchronous -- typically a few seconds per query). */
export function runCheck(brandId: string) {
  return apiFetch<BrandQuery[]>(`/v1/visibility/brands/${brandId}/run`, { method: "POST" });
}

export function getResults(brandId: string) {
  return apiFetch<VisibilityRun[]>(`/v1/visibility/brands/${brandId}/results`);
}
