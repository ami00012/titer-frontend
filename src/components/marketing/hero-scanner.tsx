"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TiterDial } from "@/components/titer/titer-dial";
import { apiErrorMessage, ApiError } from "@/lib/api/client";
import { scoreText, isUnmeasurableX, type ScoreResponse } from "@/lib/api/score";
import { track } from "@/lib/analytics";

const MIN_LENGTH = 100;

/**
 * The homepage hero IS the scanner, not a button to one (packaging doc's
 * "one screen, one shape" rule) -- a slimmed-down version of /measure's
 * text-only path, same API calls, same TiterDial. URL/video modes stay on
 * /measure itself; the hero's job is to let the instrument demonstrate
 * itself in one glance, not replicate every mode.
 */
export function HeroScanner() {
  const [text, setText] = useState("");
  const [x, setX] = useState("");

  const mutation = useMutation<ScoreResponse, ApiError, { text: string; x?: string }>({
    mutationFn: (vars) => scoreText(vars.text, vars.x),
    onMutate: (vars) => {
      track("scan_started", { mode: "text", hasCustomX: Boolean(vars.x), surface: "homepage_hero" });
    },
    onSuccess: (data) => {
      track("scan_completed", { titer: data.titer, hasX: Boolean(data.x), surface: "homepage_hero" });
    },
  });

  const trimmedX = x.trim();
  const trimmedText = text.trim();
  const tooShort = trimmedText.length > 0 && trimmedText.length < MIN_LENGTH;
  const canSubmit = !mutation.isPending && trimmedText.length >= MIN_LENGTH;

  function handleSubmit() {
    if (!canSubmit) return;
    mutation.mutate({ text, x: trimmedX || undefined });
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          if (mutation.isSuccess || mutation.isError) mutation.reset();
        }}
        placeholder="Paste a paragraph, an ad, a support reply — anything…"
        rows={5}
        className="w-full resize-none rounded-md border border-[color:var(--titer-border)] px-4 py-3 text-left text-sm text-[color:var(--titer-ink)] placeholder:text-[color:var(--titer-muted)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      />
      <div className="flex flex-col items-stretch gap-2 sm:flex-row">
        <input
          value={x}
          onChange={(event) => {
            setX(event.target.value);
            if (mutation.isSuccess || mutation.isError) mutation.reset();
          }}
          placeholder="Emotional tone (default) — or type your own: sarcasm, urgency, empathy…"
          maxLength={60}
          className="flex-1 rounded-md border border-[color:var(--titer-border)] px-4 py-2.5 text-left text-sm text-[color:var(--titer-ink)] placeholder:text-[color:var(--titer-muted)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        />
        <Button size="lg" onClick={handleSubmit} disabled={!canSubmit} className="rounded-full">
          {mutation.isPending ? "Measuring…" : trimmedX ? `Measure ${trimmedX}` : "Measure it — free"}
        </Button>
      </div>

      {tooShort ? (
        <span className="text-left text-xs text-[color:var(--titer-muted)]">
          {MIN_LENGTH - trimmedText.length} more characters needed
        </span>
      ) : null}

      {mutation.isError ? (
        <p className="text-left text-sm text-destructive">
          {isUnmeasurableX(mutation.error)
            ? "That can't be measured from text alone — try a different X."
            : apiErrorMessage(mutation.error, "Something went wrong. Try again.")}
        </p>
      ) : null}

      {mutation.data ? (
        <div className="mt-4 flex flex-col items-center gap-2 self-center">
          <TiterDial
            score={mutation.data.x ? mutation.data.x.titer : mutation.data.titer}
            direction="higher-is-better"
            label={mutation.data.x ? mutation.data.x.input : "Emotional Tone"}
            verdict={mutation.data.x ? capitalize(mutation.data.x.band) : mutation.data.verdict}
            size={120}
          />
        </div>
      ) : null}
    </div>
  );
}

function capitalize(value: string) {
  return value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
