"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export type TiterDirection = "lower-is-better" | "higher-is-better";

interface TiterDialProps {
  /** 0-100 measured level */
  score: number;
  /** All three tools (Score/Quality/Visibility) are higher-is-better today; lower-is-better exists for a future dimension where a low number is the good outcome. */
  direction?: TiterDirection;
  /** Caption above the number, e.g. "Emotional Tone" */
  label?: string;
  /** Override the auto-generated verdict line */
  verdict?: string;
  size?: number;
  className?: string;
}

const BANDS = [
  { max: 35, tone: "good", colorVar: "--status-good" },
  { max: 65, tone: "warning", colorVar: "--status-warning" },
  { max: 101, tone: "critical", colorVar: "--status-critical" },
] as const;

const DEFAULT_VERDICTS: Record<TiterDirection, Record<(typeof BANDS)[number]["tone"], string>> = {
  "lower-is-better": {
    good: "Low",
    warning: "Moderate",
    critical: "High",
  },
  "higher-is-better": {
    good: "Excellent",
    warning: "Solid, room to improve",
    critical: "Needs work",
  },
};

function bandFor(score: number, direction: TiterDirection) {
  const effective = direction === "higher-is-better" ? 100 - score : score;
  return BANDS.find((b) => effective < b.max) ?? BANDS[BANDS.length - 1];
}

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

// useSyncExternalStore (not state+effect) so the server snapshot (false) is
// used for the initial hydration pass and the real client value is applied
// right after, without a hydration mismatch or a synchronous setState-in-effect.
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

/** Counts 0 -> clamped once the dial scrolls into view; skipped entirely under reduced motion. */
function useCountOnView(target: number, reducedMotion: boolean) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (reducedMotion) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        const duration = 800;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - progress) * (1 - progress);
          setValue(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, reducedMotion]);

  return { value: reducedMotion ? target : value, ref };
}

export function TiterDial({
  score,
  direction = "lower-is-better",
  label,
  verdict,
  size = 160,
  className,
}: TiterDialProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const band = bandFor(clamped, direction);
  const resolvedVerdict = verdict ?? DEFAULT_VERDICTS[direction][band.tone];

  const reducedMotion = usePrefersReducedMotion();
  const { value: displayed, ref } = useCountOnView(clamped, reducedMotion);

  const strokeWidth = Math.round(size * 0.075);
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - displayed / 100);

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      {label ? (
        <span className="text-sm text-[color:var(--titer-muted)]">{label}</span>
      ) : null}
      <div
        ref={ref}
        role="img"
        aria-label={`${clamped} out of 100 — ${resolvedVerdict}`}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--dial-track)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`var(${band.colorVar})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={
              reducedMotion
                ? undefined
                : { transition: "stroke-dashoffset 80ms linear, stroke 300ms ease" }
            }
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="font-semibold text-[color:var(--titer-ink)]" style={{ fontSize: size * 0.3 }}>
            {displayed}
          </span>
        </div>
      </div>
      <span
        className="max-w-[14ch] text-center text-sm text-[color:var(--titer-ink)]"
        aria-hidden="true"
      >
        {resolvedVerdict}
      </span>
    </div>
  );
}
