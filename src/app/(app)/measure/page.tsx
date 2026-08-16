"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiterDial } from "@/components/titer/titer-dial";
import { FindingsList } from "@/components/titer/findings-list";
import { HeatStrip } from "@/components/titer/heat-strip";
import { ApiError } from "@/lib/api/client";
import { scoreText, scoreVideo, isUnmeasurableX, type EmotionAnalysis, type ParagraphScore, type ScoreResponse } from "@/lib/api/score";
import { track } from "@/lib/analytics";

const MIN_LENGTH = 100;
const MAX_LENGTH = 100000;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

type Mode = "text" | "url" | "video";

// "measure X" is the same capability regardless of content source -- text,
// URL, and video all carry an optional x through to the same backend
// dual-dimension flow (see ScoreService.scoreWithX / scoreVideo).
// targetAudience and emotionAnalysis are two independent additive options
// (see MeasureService.audienceContextNote / EmotionAnalysisDimension) --
// either or both can be set alongside x, or omitted entirely.
type ScoreVars =
  | { kind: "text"; input: string; x?: string; targetAudience?: string; emotionAnalysis?: boolean }
  | { kind: "video"; file: File; x?: string; targetAudience?: string; emotionAnalysis?: boolean };

export default function MeasurePage() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [x, setX] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [emotionAnalysis, setEmotionAnalysis] = useState(false);
  const [selectedParagraph, setSelectedParagraph] = useState<ParagraphScore | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mutation = useMutation<ScoreResponse, ApiError, ScoreVars>({
    mutationFn: (vars) =>
      vars.kind === "video"
        ? scoreVideo(vars.file, vars.x, vars.targetAudience, vars.emotionAnalysis)
        : scoreText(vars.input, vars.x, vars.targetAudience, vars.emotionAnalysis),
    onMutate: (vars) => {
      track("scan_started", { mode: vars.kind, hasCustomX: Boolean(vars.x), hasTargetAudience: Boolean(vars.targetAudience), emotionAnalysis: Boolean(vars.emotionAnalysis) });
    },
    onSuccess: (data) => {
      setSelectedParagraph(null);
      track("scan_completed", { titer: data.titer, hasX: Boolean(data.x) });
    },
  });

  // Only meaningful in text mode -- URL/video results have no visible source
  // textarea to scroll within, so the heat-strip still filters findings there
  // but skips this part.
  function handleSelectParagraph(paragraph: ParagraphScore) {
    setSelectedParagraph((current) => (current?.index === paragraph.index ? null : paragraph));
    if (mode === "text" && textareaRef.current) {
      const [start, end] = paragraph.span;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(start, end);
      const before = text.slice(0, start);
      const lineNumber = before.split("\n").length;
      const lineHeight = 20;
      textareaRef.current.scrollTop = Math.max(0, (lineNumber - 2) * lineHeight);
    }
  }

  const trimmedX = x.trim();
  const trimmedUrl = url.trim();

  const tooShort = mode === "text" && text.trim().length > 0 && text.trim().length < MIN_LENGTH;
  const looksLikeUrl = /^https?:\/\/\S+$/i.test(trimmedUrl);

  const canSubmit =
    !mutation.isPending &&
    (mode === "text"
      ? text.trim().length >= MIN_LENGTH && text.length <= MAX_LENGTH
      : mode === "url"
        ? looksLikeUrl
        : videoFile !== null);

  const buttonLabel = mutation.isPending
    ? mode === "video"
      ? "Transcribing & analyzing…"
      : "Analyzing…"
    : trimmedX
      ? `Measure ${trimmedX}`
      : "Measure Emotional Tone";

  const trimmedAudience = targetAudience.trim();

  function handleAnalyze() {
    if (mode === "video") {
      if (videoFile) {
        mutation.mutate({
          kind: "video", file: videoFile, x: trimmedX || undefined,
          targetAudience: trimmedAudience || undefined, emotionAnalysis,
        });
      }
      return;
    }
    mutation.mutate({
      kind: "text", input: mode === "url" ? trimmedUrl : text, x: trimmedX || undefined,
      targetAudience: trimmedAudience || undefined, emotionAnalysis,
    });
  }

  // Explicit args, not the closed-over `x` state -- setX() + mutate() in the same
  // handler would otherwise race React's batched state update against the mutation
  // reading a stale `x` from this render's closure.
  function handleSuggestionClick(suggestion: string) {
    setX(suggestion);
    if (mode === "video") {
      if (videoFile) {
        mutation.mutate({
          kind: "video", file: videoFile, x: suggestion,
          targetAudience: trimmedAudience || undefined, emotionAnalysis,
        });
      }
      return;
    }
    mutation.mutate({
      kind: "text", input: mode === "url" ? trimmedUrl : text, x: suggestion,
      targetAudience: trimmedAudience || undefined, emotionAnalysis,
    });
  }

  function switchMode(next: Mode) {
    setMode(next);
    mutation.reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Measure</h1>
        <p className="text-secondary-foreground">
          Paste text, paste a URL, or upload a video — measure anything in it. Emotional tone by
          default, or type your own dimension.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Any content</CardTitle>
          <CardDescription>
            {mode === "text"
              ? `Between ${MIN_LENGTH} and ${MAX_LENGTH.toLocaleString()} characters.`
              : mode === "url"
                ? "We fetch the page and extract the article text."
                : "Transcribed locally on our server, no external API — may take a minute or two for longer clips."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex gap-1 rounded-md border border-border bg-muted/30 p-1 text-sm">
              {(["text", "url", "video"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 rounded-sm px-3 py-1.5 capitalize transition-colors ${
                    mode === m ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "url" ? "URL" : m}
                </button>
              ))}
            </div>

            {mode === "text" ? (
              <>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Paste a paragraph or article to measure…"
                  rows={10}
                  className="w-full resize-none rounded-md border border-input bg-input/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {tooShort
                      ? `${MIN_LENGTH - text.trim().length} more characters needed`
                      : `${text.length} characters`}
                  </span>
                </div>
              </>
            ) : mode === "url" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="url-input">Page URL</Label>
                <Input
                  id="url-input"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com/blog/post"
                />
                {trimmedUrl.length > 0 && !looksLikeUrl ? (
                  <p className="text-xs text-destructive">Must start with http:// or https://</p>
                ) : null}
              </div>
            ) : (
              <VideoUploadField file={videoFile} onChange={setVideoFile} />
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="x-input">What do you want to measure?</Label>
              <Input
                id="x-input"
                value={x}
                onChange={(event) => setX(event.target.value)}
                placeholder="Emotional tone (default) — or type your own: sarcasm, urgency, empathy…"
                maxLength={60}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="audience-input">Target audience (optional)</Label>
              <Input
                id="audience-input"
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
                placeholder="e.g. developers evaluating a CLI tool, first-time parents…"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Scores how well this will land with this specific reader, not just in the abstract.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={emotionAnalysis}
                onChange={(event) => setEmotionAnalysis(event.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Also run general emotion analysis
            </label>

            <div>
              <Button onClick={handleAnalyze} disabled={!canSubmit}>
                {buttonLabel}
              </Button>
            </div>

            {mutation.isError && !isUnmeasurableX(mutation.error) ? (
              <p className="text-sm text-destructive">{extractErrorMessage(mutation.error)}</p>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-4 sm:w-80">
            {mutation.isError && isUnmeasurableX(mutation.error) ? (
              <RefusalCard error={mutation.error} onSuggestionClick={handleSuggestionClick} />
            ) : mutation.data ? (
              <ResultSummary
                response={mutation.data}
                selectedParagraph={selectedParagraph}
                onSelectParagraph={handleSelectParagraph}
              />
            ) : (
              <Badge variant="secondary">Awaiting input</Badge>
            )}
          </div>
        </div>

        {/* Full-width, below the form/summary row rather than crammed into the sidebar --
            findings render in a responsive grid (see FindingsList) so the page's own width
            does the work a narrow column can't: shorter cards, no long one-column scroll. */}
        {mutation.data ? (
          <ResultFindings
            response={mutation.data}
            selectedParagraph={selectedParagraph}
            sourceText={mode === "text" ? text : undefined}
          />
        ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function VideoUploadField({ file, onChange }: { file: File | null; onChange: (file: File | null) => void }) {
  const [error, setError] = useState<string | null>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (selected && selected.size > MAX_VIDEO_BYTES) {
      setError(`Video exceeds the ${MAX_VIDEO_BYTES / (1024 * 1024)}MB limit`);
      onChange(null);
      return;
    }
    setError(null);
    onChange(selected);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="video-input">Video file</Label>
      <input
        id="video-input"
        type="file"
        accept="video/*"
        onChange={handleFile}
        className="w-full rounded-md border border-input bg-input/30 px-3 py-2 text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-secondary-foreground"
      />
      {file ? (
        <p className="text-xs text-muted-foreground">
          {file.name} ({(file.size / (1024 * 1024)).toFixed(1)}MB)
        </p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/** Score dial(s) + heat strip only -- compact enough for the sidebar. Findings moved out to
 *  ResultFindings, a full-width section below the form, since a grid of finding cards needs
 *  real page width to be worth anything (see that component). */
function ResultSummary({
  response,
  selectedParagraph,
  onSelectParagraph,
}: {
  response: ScoreResponse;
  selectedParagraph: ParagraphScore | null;
  onSelectParagraph: (paragraph: ParagraphScore) => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      {response.targetAudience ? (
        <Badge variant="outline">Scored for: {response.targetAudience}</Badge>
      ) : null}

      <div className="flex flex-col items-center gap-2">
        {/* emotional_tone's titer is "how strongly this connects emotionally" --
            100 = highly resonant (ScoreCombiner.verdict / emotional_tone.yaml bands). */}
        <TiterDial
          score={response.titer}
          direction="higher-is-better"
          label="Emotional Tone"
          verdict={response.verdict}
          size={140}
        />
      </div>

      <HeatStrip
        paragraphs={response.paragraphs}
        selectedIndex={selectedParagraph?.index ?? null}
        onSelectParagraph={onSelectParagraph}
      />

      {response.x ? (
        <div className="flex w-full flex-col items-center gap-2 border-t border-border pt-4">
          <TiterDial
            score={response.x.titer}
            direction="higher-is-better"
            label={response.x.input}
            verdict={capitalize(response.x.band)}
            size={140}
          />
          <p className="text-center text-sm text-secondary-foreground">{response.x.interpretation}</p>
          <Badge variant={response.x.confidence === "calibrated" ? "default" : "outline"}>
            {response.x.confidence === "calibrated" ? "Calibrated ✓" : "Ad-hoc meter"}
          </Badge>
        </div>
      ) : null}

      {response.emotionAnalysis ? <EmotionBars emotionAnalysis={response.emotionAnalysis} /> : null}
    </div>
  );
}

/** Proportional bar list, not eight separate dials -- a general breakdown across joy/trust/fear/surprise/sadness/disgust/anger/anticipation reads better as one compact ranked list than eight competing circles. */
function EmotionBars({ emotionAnalysis }: { emotionAnalysis: EmotionAnalysis }) {
  const entries = Object.entries(emotionAnalysis.components).sort(([, a], [, b]) => b - a);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-3 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Emotion analysis</span>
        <Badge variant="secondary">{capitalize(emotionAnalysis.band)}</Badge>
      </div>
      <div className="flex flex-col gap-2">
        {entries.map(([emotion, score]) => (
          <div key={emotion} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 capitalize text-secondary-foreground">{emotion}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right text-muted-foreground">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full width so FindingsList's grid actually has room to lay out multiple columns -- see
 *  page.tsx's CardContent, this renders below the form/summary row, not inside the sidebar. */
function ResultFindings({
  response,
  selectedParagraph,
  sourceText,
}: {
  response: ScoreResponse;
  selectedParagraph: ParagraphScore | null;
  sourceText?: string;
}) {
  const primaryFindings = filterBySelectedParagraph(response.findings, selectedParagraph);
  const xFindings = response.x ? filterBySelectedParagraph(response.x.findings, selectedParagraph) : [];

  return (
    <div className="flex w-full flex-col gap-6">
      <FindingsList findings={response.x ? xFindings : primaryFindings} sourceText={sourceText} />
      {response.emotionAnalysis ? (
        <div className="border-t border-border pt-6">
          <FindingsList
            findings={response.emotionAnalysis.findings}
            sourceText={sourceText}
            dimensionKey={response.emotionAnalysis.dimension}
          />
        </div>
      ) : null}
    </div>
  );
}

function filterBySelectedParagraph<T extends { span: [number, number] }>(
  findings: T[],
  paragraph: ParagraphScore | null,
): T[] {
  if (!paragraph) return findings;
  const [pStart, pEnd] = paragraph.span;
  return findings.filter((finding) => {
    const [fStart] = finding.span;
    return fStart >= 0 && fStart >= pStart && fStart < pEnd;
  });
}

function RefusalCard({
  error,
  onSuggestionClick,
}: {
  error: ApiError;
  onSuggestionClick: (suggestion: string) => void;
}) {
  const body = error.body as { error?: { message?: string; detail?: { reason?: string; suggestions?: string[] } } } | undefined;
  const message = body?.error?.message ?? "That can't be measured from text alone.";
  const suggestions = body?.error?.detail?.suggestions ?? [];

  return (
    <div className="flex w-full flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4">
      <p className="text-sm font-medium text-destructive">{message}</p>
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick(suggestion)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-muted"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function capitalize(value: string) {
  return value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function extractErrorMessage(error: ApiError): string {
  const body = error.body as { error?: { message?: string } } | undefined;
  return body?.error?.message ?? "Something went wrong. Try again.";
}
