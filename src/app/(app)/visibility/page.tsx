"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import {
  addQuery,
  createBrand,
  listBrands,
  listQueries,
  runCheck,
  type Brand,
  type BrandQuery,
} from "@/lib/api/visibility";
import { track } from "@/lib/analytics";

const SENTIMENT_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  positive: "default",
  neutral: "secondary",
  negative: "destructive",
};

export default function VisibilityPage() {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const brandsQuery = useQuery({ queryKey: ["visibility", "brands"], queryFn: listBrands });

  const brands = brandsQuery.data ?? [];
  const selectedBrand = brands.find((b) => b.id === selectedBrandId) ?? brands[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Titer Visibility</h1>
        <p className="text-secondary-foreground">
          Ask Claude your customers&apos; real questions, see whether your brand comes up, and how it&apos;s
          characterized when it does.
        </p>
      </div>

      {brandsQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : brandsQuery.isError ? (
        <p className="text-sm text-destructive">{apiErrorMessage(brandsQuery.error, "Couldn't load brands.")}</p>
      ) : (
        <>
          {brands.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <Button
                  key={brand.id}
                  size="sm"
                  variant={selectedBrand?.id === brand.id ? "default" : "outline"}
                  onClick={() => setSelectedBrandId(brand.id)}
                >
                  {brand.name}
                </Button>
              ))}
            </div>
          ) : null}

          {selectedBrand ? (
            <BrandPanel brand={selectedBrand} />
          ) : (
            <AddBrandForm onCreated={(brand) => setSelectedBrandId(brand.id)} />
          )}

          {brands.length > 0 ? <AddBrandForm compact onCreated={(brand) => setSelectedBrandId(brand.id)} /> : null}
        </>
      )}
    </div>
  );
}

function AddBrandForm({ onCreated, compact }: { onCreated: (brand: Brand) => void; compact?: boolean }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [competitorsText, setCompetitorsText] = useState("");

  const mutation = useMutation<Brand, ApiError, void>({
    mutationFn: () => {
      const competitors = competitorsText
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      return createBrand(name.trim(), domain.trim(), competitors);
    },
    onSuccess: (brand) => {
      track("visibility_brand_created", { domain: brand.domain });
      queryClient.invalidateQueries({ queryKey: ["visibility", "brands"] });
      setName("");
      setDomain("");
      setCompetitorsText("");
      onCreated(brand);
    },
  });

  const canSubmit = name.trim().length > 0 && domain.trim().length > 0 && !mutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{compact ? "Track another brand" : "Track a brand"}</CardTitle>
        {!compact ? <CardDescription>Your own brand, or a competitor you want to watch.</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="brand-name">Brand name</Label>
            <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="brand-domain">Domain</Label>
            <Input id="brand-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="acme.com" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brand-competitors">Competitors (optional, comma-separated)</Label>
          <Input
            id="brand-competitors"
            value={competitorsText}
            onChange={(e) => setCompetitorsText(e.target.value)}
            placeholder="Rival Co, Other Inc"
          />
        </div>
        <div>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit}>
            {mutation.isPending ? "Adding…" : "Add brand"}
          </Button>
        </div>
        {mutation.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(mutation.error, "Couldn't add this brand.")}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function BrandPanel({ brand }: { brand: Brand }) {
  const queryClient = useQueryClient();
  const [queryText, setQueryText] = useState("");
  const queriesQuery = useQuery({ queryKey: ["visibility", "brands", brand.id, "queries"], queryFn: () => listQueries(brand.id) });

  const addMutation = useMutation<BrandQuery, ApiError, void>({
    mutationFn: () => addQuery(brand.id, queryText.trim()),
    onSuccess: () => {
      setQueryText("");
      queryClient.invalidateQueries({ queryKey: ["visibility", "brands", brand.id, "queries"] });
      queryClient.invalidateQueries({ queryKey: ["visibility", "brands"] });
    },
  });

  const runMutation = useMutation<BrandQuery[], ApiError, void>({
    mutationFn: () => runCheck(brand.id),
    onMutate: () => track("visibility_check_started", { brandId: brand.id, queryCount: queriesQuery.data?.length ?? 0 }),
    onSuccess: (queries) => {
      queryClient.setQueryData(["visibility", "brands", brand.id, "queries"], queries);
    },
  });

  const queries = queriesQuery.data ?? [];
  const activeQueries = queries.filter((q) => q.active);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{brand.name}</CardTitle>
              <CardDescription>{brand.domain}</CardDescription>
            </div>
            <Button onClick={() => runMutation.mutate()} disabled={runMutation.isPending || activeQueries.length === 0}>
              {runMutation.isPending ? "Asking Claude…" : "Run check"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="query-text">Add a question a real customer might ask</Label>
              <Input
                id="query-text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="What's a good tool for X?"
              />
            </div>
            <Button variant="outline" onClick={() => addMutation.mutate()} disabled={!queryText.trim() || addMutation.isPending}>
              {addMutation.isPending ? "Adding…" : "Add"}
            </Button>
          </div>
          {addMutation.isError ? (
            <p className="text-sm text-destructive">{apiErrorMessage(addMutation.error, "Couldn't add this query.")}</p>
          ) : null}
          {runMutation.isError ? (
            <p className="text-sm text-destructive">{apiErrorMessage(runMutation.error, "Couldn't run the check.")}</p>
          ) : null}
        </CardContent>
      </Card>

      {queriesQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : activeQueries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions yet — add one above, then run a check.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {activeQueries.map((query) => (
            <QueryResultCard key={query.id} query={query} brandName={brand.name} />
          ))}
        </div>
      )}
    </div>
  );
}

function QueryResultCard({ query, brandName }: { query: BrandQuery; brandName: string }) {
  const [expanded, setExpanded] = useState(false);
  const run = query.latestRun;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6">
        <p className="text-sm font-medium">{query.text}</p>
        {!run ? (
          <p className="text-sm text-muted-foreground">Not checked yet — run a check to see how Claude answers this.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={run.mentioned ? "default" : "outline"}>{run.mentioned ? `Mentions ${brandName}` : "Not mentioned"}</Badge>
              {run.mentioned ? <Badge variant={run.cited ? "default" : "secondary"}>{run.cited ? "Cited" : "Mentioned only"}</Badge> : null}
              {run.mentioned && run.position ? <Badge variant="outline">Position {run.position}</Badge> : null}
              {run.mentioned ? <Badge variant={SENTIMENT_BADGE[run.sentiment] ?? "outline"}>{run.sentiment}</Badge> : null}
              <span className="text-muted-foreground">{new Date(run.runAt).toLocaleString()}</span>
            </div>
            {run.accuracyFlags.length > 0 ? (
              <div className="flex flex-col gap-1">
                {run.accuracyFlags.map((flag, i) => (
                  <p key={i} className="text-sm text-destructive">
                    ⚠ {flag}
                  </p>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              className="self-start text-xs text-muted-foreground underline underline-offset-2"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Hide Claude's answer" : "Show Claude's answer"}
            </button>
            {expanded ? (
              <p className="rounded-md border border-border bg-muted/30 p-3 text-sm text-secondary-foreground">{run.rawAnswer}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
