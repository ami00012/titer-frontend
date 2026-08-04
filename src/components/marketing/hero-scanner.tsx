"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

const MIN_LENGTH = 100;

/**
 * The homepage hero used to call /v1/score directly for an anonymous, live
 * result. Scoring now requires an account (see PROTECTED_PREFIXES in
 * src/lib/supabase/proxy.ts and SecurityConfig on the backend), so pasting
 * content here hands off to signup instead of hitting the API -- the
 * paste-box still hooks a visitor with their own content, it just leads to
 * an account instead of a number. LiveDemoAnimation right below this section
 * is what actually shows the instrument working, with no backend call.
 */
export function HeroScanner() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [x, setX] = useState("");

  const trimmedX = x.trim();
  const trimmedText = text.trim();
  const tooShort = trimmedText.length > 0 && trimmedText.length < MIN_LENGTH;
  const canSubmit = trimmedText.length >= MIN_LENGTH;

  function handleSubmit() {
    if (!canSubmit) return;
    track("scan_started", { mode: "text", hasCustomX: Boolean(trimmedX), surface: "homepage_hero" });
    router.push("/signup?next=/measure");
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Paste a paragraph, an ad, a support reply — anything…"
        rows={5}
        className="w-full resize-none rounded-md border border-[color:var(--titer-border)] px-4 py-3 text-left text-sm text-[color:var(--titer-ink)] placeholder:text-[color:var(--titer-muted)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      />
      <div className="flex flex-col items-stretch gap-2 sm:flex-row">
        <input
          value={x}
          onChange={(event) => setX(event.target.value)}
          placeholder="Emotional tone (default) — or type your own: sarcasm, urgency, empathy…"
          maxLength={60}
          className="flex-1 rounded-md border border-[color:var(--titer-border)] px-4 py-2.5 text-left text-sm text-[color:var(--titer-ink)] placeholder:text-[color:var(--titer-muted)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        />
        <Button size="lg" onClick={handleSubmit} disabled={!canSubmit} className="rounded-full">
          {trimmedX ? `Sign up to measure ${trimmedX}` : "Sign up to measure it — free"}
        </Button>
      </div>

      {tooShort ? (
        <span className="text-left text-xs text-[color:var(--titer-muted)]">
          {MIN_LENGTH - trimmedText.length} more characters needed
        </span>
      ) : null}
    </div>
  );
}
