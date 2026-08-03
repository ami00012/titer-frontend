"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/badge";
import { TiterDial, type TiterDirection } from "@/components/titer/titer-dial";

interface Demo {
  pillar: string;
  text: string;
  /** [start, end) substring of `text` the finding quotes -- highlighted once the result phase starts. */
  highlight: [number, number];
  score: number;
  direction: TiterDirection;
  verdict: string;
  outcome: string;
  finding: string;
}

const DEMOS: Demo[] = [
  {
    pillar: "Score",
    text: "We truly care about every customer's journey — your satisfaction is our top priority.",
    highlight: [0, 88],
    score: 14,
    direction: "higher-is-better",
    verdict: "flat and clinical",
    outcome: "Scored",
    finding: "Generic empathy vocabulary, no specific claim or named stakes — reads as corporate boilerplate, not real warmth.",
  },
  {
    pillar: "Compliance",
    text: "Guaranteed 20% returns every year, with zero risk to your capital.",
    highlight: [0, 67],
    score: 91,
    direction: "lower-is-better",
    verdict: "blocked",
    outcome: "Flagged",
    finding: "Promissory return claim with no risk disclosure — a real regulatory citation, not a guess.",
  },
  {
    pillar: "Visibility",
    text: "\"For content-measurement tools, options include Titer, which scores emotional tone and compliance risk.\"",
    highlight: [24, 30],
    score: 58,
    direction: "higher-is-better",
    verdict: "mentioned, not linked",
    outcome: "Tracked",
    finding: "Brand named in an AI answer but not cited as a source — a real visibility gap to close.",
  },
];

const TYPE_MS_PER_CHAR = 18;
const ANALYZING_MS = 700;
const RESULT_HOLD_MS = 4200;

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

// Same useSyncExternalStore approach as TiterDial's own usePrefersReducedMotion
// -- avoids a setState-in-effect (the server snapshot covers hydration, the
// real client value applies right after, no extra effect needed).
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}

type Phase = "typing" | "analyzing" | "result";

/**
 * Self-playing, no backend calls -- purely illustrative for anonymous
 * coming-soon visitors. Cycles through Score/Compliance/Visibility examples:
 * types the sample text in, pauses on "Analyzing…", then reveals a real
 * TiterDial (remounted via `key` each cycle so its own count-up-on-view
 * animation replays) plus a highlighted quote and finding.
 */
export function LiveDemoAnimation() {
  const reducedMotion = usePrefersReducedMotion();
  const [demoIndex, setDemoIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedLength, setTypedLength] = useState(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const demo = DEMOS[demoIndex];

  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    // Every state transition below runs inside a setTimeout callback (even the
    // "start immediately" ones, at 0ms) rather than synchronously in the
    // effect body -- this is an imperative timer-driven animation sequence,
    // not a sync-with-external-system effect, so state updates belong in
    // callbacks throughout, not just the later steps.
    if (reducedMotion) {
      // Skip the letter-by-letter/count-up motion entirely; still rotate
      // examples on a plain content timer (not the kind of motion
      // prefers-reduced-motion is meant to suppress) so the section isn't
      // just a single static screenshot forever.
      timeouts.current.push(
        setTimeout(() => {
          setTypedLength(demo.text.length);
          setPhase("result");
        }, 0),
      );
      timeouts.current.push(setTimeout(() => setDemoIndex((i) => (i + 1) % DEMOS.length), RESULT_HOLD_MS));
      return () => timeouts.current.forEach(clearTimeout);
    }

    timeouts.current.push(
      setTimeout(() => {
        setPhase("typing");
        setTypedLength(0);
      }, 0),
    );
    let i = 0;
    const typeNext = () => {
      i += 1;
      setTypedLength(i);
      if (i < demo.text.length) {
        timeouts.current.push(setTimeout(typeNext, TYPE_MS_PER_CHAR));
      } else {
        timeouts.current.push(
          setTimeout(() => {
            setPhase("analyzing");
            timeouts.current.push(
              setTimeout(() => {
                setPhase("result");
                timeouts.current.push(
                  setTimeout(() => setDemoIndex((i2) => (i2 + 1) % DEMOS.length), RESULT_HOLD_MS),
                );
              }, ANALYZING_MS),
            );
          }, 300),
        );
      }
    };
    timeouts.current.push(setTimeout(typeNext, TYPE_MS_PER_CHAR));

    return () => timeouts.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoIndex, reducedMotion]);

  const shown = demo.text.slice(0, typedLength);
  const [hStart, hEnd] = demo.highlight;
  const showHighlight = phase === "result";

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-[color:var(--titer-border)] bg-[color:var(--titer-card,transparent)] p-6 shadow-[0_2px_10px_rgba(17,19,24,0.06)]">
      <div className="flex items-center justify-between">
        <Badge variant="outline">{demo.pillar}</Badge>
        <span className="text-xs text-[color:var(--titer-muted)]">
          {phase === "typing" ? "Pasting content…" : phase === "analyzing" ? "Analyzing…" : demo.outcome}
        </span>
      </div>

      <p className="min-h-[4.5rem] text-sm leading-relaxed text-[color:var(--titer-ink)]">
        {showHighlight ? (
          <>
            {shown.slice(0, hStart)}
            <mark className="rounded bg-[color:var(--status-warning)]/25 px-0.5 text-[color:var(--titer-ink)]">
              {shown.slice(hStart, hEnd)}
            </mark>
            {shown.slice(hEnd)}
          </>
        ) : (
          <>
            {shown}
            {phase === "typing" ? <span className="animate-pulse">▍</span> : null}
          </>
        )}
      </p>

      <div className="flex items-center justify-center py-2">
        {phase === "analyzing" ? (
          <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border-2 border-dashed border-[color:var(--titer-border)]">
            <span className="h-3 w-3 animate-ping rounded-full bg-[color:var(--titer-muted)]" />
          </div>
        ) : phase === "result" ? (
          <TiterDial key={demoIndex} score={demo.score} direction={demo.direction} verdict={demo.verdict} size={100} />
        ) : (
          <div className="h-[100px] w-[100px] rounded-full border-2 border-dashed border-[color:var(--titer-border)]" />
        )}
      </div>

      <p
        className={`text-center text-xs text-[color:var(--titer-muted)] transition-opacity duration-500 ${
          phase === "result" ? "opacity-100" : "opacity-0"
        }`}
      >
        {demo.finding}
      </p>
    </div>
  );
}
