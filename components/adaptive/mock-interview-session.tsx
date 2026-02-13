"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Pause,
  Play,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useInterviewMode } from "./interview-mode-provider";
import { useModeInterviewDate } from "./use-mode-interview-date";
import {
  buildMockInterviewerScript,
  deriveCoachingThemes,
  evaluateMockAnswer,
  evaluateMockSession,
} from "@/lib/adaptive/mock-interviewer";
import type { AssetKind } from "@/lib/adaptive/types";
import {
  appendPrepHistoryEntry,
  getPrepHistoryStorageKey,
  parsePrepHistory,
  type PrepSessionSnapshot,
} from "@/lib/adaptive/prep-history";
import { getMockSessionStorageKey } from "@/lib/adaptive/storage-keys";
import { getInterviewDateSummary } from "@/lib/adaptive/interview-date";
import { copyTextToClipboard } from "@/lib/clipboard";
import {
  parseStoredMockSessionState,
  type StoredMockSessionState,
} from "@/lib/adaptive/prep-data-bundle";

interface SessionQuestion {
  question: string;
  whatTheyAreTesting: string;
  answerStrategy: string;
  recommendedArtifact?: {
    title: string;
    url: string;
    kind: AssetKind;
  };
}

const warmupQuestion: SessionQuestion = {
  question:
    "Give me a 60-second opening: why are you a strong fit for this team and role?",
  whatTheyAreTesting:
    "Narrative clarity, positioning, and your ability to frame relevance quickly.",
  answerStrategy:
    "Use a compact arc: role fit, one credible example, and what value you can create in the first 90 days.",
};

type SessionMode = "standard" | "pressure";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function estimateSpeechSeconds(wordCount: number, wordsPerMinute = 140): number {
  if (!wordCount) return 0;
  return Math.round((wordCount / wordsPerMinute) * 60);
}

function formatSeconds(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function buildQuestionOrder(
  mode: SessionMode,
  questionCount: number
): number[] {
  const ordered = Array.from({ length: questionCount }, (_, index) => index);
  if (mode !== "pressure" || questionCount <= 2) return ordered;

  const tail = ordered.slice(1);
  for (let i = tail.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [tail[i], tail[randomIndex]] = [tail[randomIndex], tail[i]];
  }
  return [0, ...tail];
}

function isValidQuestionOrder(order: number[], questionCount: number): boolean {
  if (order.length !== questionCount) return false;
  const sorted = [...order].sort((a, b) => a - b);
  return sorted.every((value, index) => value === index);
}

export function MockInterviewSession() {
  const { companyId, personaId } = useInterviewMode();
  const { interviewDate } = useModeInterviewDate({ companyId, personaId });
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [confidences, setConfidences] = useState<number[]>([]);
  const [sessionMode, setSessionMode] = useState<SessionMode>("standard");
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [loadedFromDraft, setLoadedFromDraft] = useState(false);
  const [timerDuration, setTimerDuration] = useState(90);
  const [timerRemaining, setTimerRemaining] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);

  const script = useMemo(() => {
    if (!companyId || !personaId) return null;
    return buildMockInterviewerScript(companyId, personaId);
  }, [companyId, personaId]);

  const baseQuestions = useMemo<SessionQuestion[]>(() => {
    if (!script) return [];
    return [warmupQuestion, ...script.prompts];
  }, [script]);

  const sessionQuestions = useMemo<SessionQuestion[]>(() => {
    if (!baseQuestions.length) return [];
    if (!isValidQuestionOrder(questionOrder, baseQuestions.length)) {
      return baseQuestions;
    }
    return questionOrder.map((index) => baseQuestions[index]);
  }, [baseQuestions, questionOrder]);

  const currentQuestion = sessionQuestions[currentIndex];
  const currentAnswer = answers[currentIndex] ?? "";
  const currentConfidence = confidences[currentIndex] ?? 3;
  const currentFeedback = evaluateMockAnswer(currentAnswer);
  const currentWordCount = countWords(currentAnswer);
  const currentSpeechSeconds = estimateSpeechSeconds(currentWordCount);
  const interviewTimeline = getInterviewDateSummary(interviewDate);
  const isInterviewSoon =
    interviewTimeline.daysUntil !== null &&
    interviewTimeline.daysUntil >= 0 &&
    interviewTimeline.daysUntil <= 2;
  const recommendedMode: SessionMode = isInterviewSoon ? "pressure" : "standard";
  const report = evaluateMockSession(answers.slice(0, sessionQuestions.length));
  const scriptHeading = script?.heading ?? "Mock interview session";
  const coachingThemes = useMemo(() => {
    return deriveCoachingThemes(report.feedbackByQuestion, 3);
  }, [report.feedbackByQuestion]);
  const reportText = useMemo(() => {
    const timestamp = new Date().toISOString();
    const header = [
      "Nick Wiley Interview Prep Report",
      `Generated: ${timestamp}`,
      `Mode: ${companyId ?? "general"} / ${personaId ?? "persona-not-set"}`,
      `Session: ${scriptHeading}`,
      `Interview timeline: ${interviewTimeline.label}`,
      `Average score: ${report.averageScore}/100`,
      `Average confidence: ${
        confidences.length
          ? (
              confidences.reduce((sum, confidence) => sum + confidence, 0) /
              confidences.length
            ).toFixed(1)
          : "N/A"
      }/5`,
      "",
    ];

    const questionSections = sessionQuestions.map((question, index) => {
      const answer = answers[index]?.trim() || "(no answer recorded)";
      const feedback = report.feedbackByQuestion[index];
      const strengths = feedback?.strengths.length
        ? feedback.strengths.map((strength) => `  - ${strength}`).join("\n")
        : "  - None captured";
      const gaps = feedback?.gaps.length
        ? feedback.gaps.map((gap) => `  - ${gap}`).join("\n")
        : "  - None captured";

      return [
        `Q${index + 1}: ${question.question}`,
        `Testing: ${question.whatTheyAreTesting}`,
        `Score: ${feedback?.score ?? 0}/100`,
        `Confidence: ${confidences[index] ?? 3}/5`,
        "Answer:",
        answer,
        "Strengths:",
        strengths,
        "Gaps:",
        gaps,
        `Coaching: ${feedback?.coachingPrompt ?? "N/A"}`,
        "",
      ].join("\n");
    });

    return [...header, ...questionSections].join("\n");
  }, [
    answers,
    companyId,
    confidences,
    personaId,
    report,
    scriptHeading,
    sessionQuestions,
    interviewTimeline.label,
  ]);

  const loadPersistedSession = useCallback(() => {
    if (!companyId || !personaId || !baseQuestions.length) return;

    const key = getMockSessionStorageKey(companyId, personaId);
    const storedRaw = localStorage.getItem(key);
    if (!storedRaw) {
      setLoadedFromDraft(false);
      return;
    }

    try {
      const stored = parseStoredMockSessionState(storedRaw);
      if (!stored) {
        localStorage.removeItem(key);
        setLoadedFromDraft(false);
        return;
      }
      const restoredMode: SessionMode =
        stored.sessionMode === "pressure" ? "pressure" : "standard";
      const restoredOrderRaw = Array.isArray(stored.questionOrder)
        ? stored.questionOrder.map((value) => Number(value))
        : [];
      const restoredOrder = isValidQuestionOrder(
        restoredOrderRaw,
        baseQuestions.length
      )
        ? restoredOrderRaw
        : buildQuestionOrder(restoredMode, baseQuestions.length);
      const normalizedAnswers = Array.from(
        { length: baseQuestions.length },
        (_, index) => stored.answers[index] ?? ""
      );
      const normalizedConfidences = Array.from(
        { length: baseQuestions.length },
        (_, index) => {
          const confidence = stored.confidences?.[index];
          if (typeof confidence !== "number") return 3;
          return Math.min(5, Math.max(1, Math.round(confidence)));
        }
      );

      setSessionMode(restoredMode);
      setQuestionOrder(restoredOrder);
      setAnswers(normalizedAnswers);
      setConfidences(normalizedConfidences);
      setCurrentIndex(
        Math.max(0, Math.min(stored.currentIndex ?? 0, baseQuestions.length - 1))
      );
      setCompleted(Boolean(stored.completed));
      setStarted(Boolean(stored.started));
      setLoadedFromDraft(
        Boolean(
          stored.started ||
            stored.answers.some(Boolean) ||
            stored.confidences?.some((confidence) => confidence !== 3)
        )
      );
    } catch {
      localStorage.removeItem(key);
      setLoadedFromDraft(false);
    }
  }, [baseQuestions.length, companyId, personaId]);

  useEffect(() => {
    loadPersistedSession();
  }, [loadPersistedSession]);

  useEffect(() => {
    if (!companyId || !personaId) return;
    const key = getMockSessionStorageKey(companyId, personaId);

    function onStorage(event: StorageEvent) {
      if (event.key === key) {
        loadPersistedSession();
      }
    }

    function onMockSessionUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail?.key === key) {
        loadPersistedSession();
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("adaptive-mock-session-updated", onMockSessionUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "adaptive-mock-session-updated",
        onMockSessionUpdate
      );
    };
  }, [companyId, loadPersistedSession, personaId]);

  useEffect(() => {
    if (!timerRunning) return;
    if (timerRemaining <= 0) {
      setTimerRunning(false);
      return;
    }

    const interval = window.setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRemaining, timerRunning]);

  useEffect(() => {
    if (!started || completed) {
      setTimerRunning(false);
      setTimerRemaining(timerDuration);
      return;
    }
    setTimerRunning(false);
    setTimerRemaining(timerDuration);
  }, [completed, currentIndex, started, timerDuration]);

  useEffect(() => {
    if (sessionMode === "pressure" && timerDuration !== 60) {
      setTimerDuration(60);
    }
  }, [sessionMode, timerDuration]);

  useEffect(() => {
    if (!companyId || !personaId) return;

    if (
      !started &&
      answers.every((answer) => !answer.trim()) &&
      confidences.every((confidence) => confidence === 3)
    ) {
      localStorage.removeItem(getMockSessionStorageKey(companyId, personaId));
      return;
    }

    const payload: StoredMockSessionState = {
      answers,
      confidences,
      sessionMode,
      questionOrder,
      currentIndex,
      completed,
      started,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      getMockSessionStorageKey(companyId, personaId),
      JSON.stringify(payload)
    );
  }, [
    answers,
    companyId,
    completed,
    confidences,
    currentIndex,
    personaId,
    questionOrder,
    sessionMode,
    started,
  ]);

  function startSession() {
    const order = buildQuestionOrder(sessionMode, baseQuestions.length);
    setQuestionOrder(order);
    setAnswers(Array.from({ length: baseQuestions.length }, () => ""));
    setConfidences(Array.from({ length: baseQuestions.length }, () => 3));
    setCurrentIndex(0);
    setCompleted(false);
    setStarted(true);
    setLoadedFromDraft(false);
    const nextDuration = sessionMode === "pressure" ? 60 : timerDuration;
    setTimerDuration(nextDuration);
    setTimerRunning(false);
    setTimerRemaining(nextDuration);
  }

  function updateCurrentAnswer(nextValue: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = nextValue;
      return next;
    });
  }

  function updateCurrentConfidence(nextConfidence: number) {
    setConfidences((prev) => {
      const next = [...prev];
      next[currentIndex] = nextConfidence;
      return next;
    });
  }

  function nextQuestion() {
    if (currentIndex >= sessionQuestions.length - 1) {
      completeSession();
      return;
    }
    setCurrentIndex((index) => index + 1);
  }

  function completeSession() {
    if (companyId && personaId) {
      const topThemes = deriveCoachingThemes(report.feedbackByQuestion, 3).map(
        ([theme]) => theme
      );
      const historyKey = getPrepHistoryStorageKey(companyId, personaId);
      const existing = parsePrepHistory(localStorage.getItem(historyKey));
      const entry: PrepSessionSnapshot = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        averageScore: report.averageScore,
        averageConfidence: confidences.length
          ? Number(
              (
                confidences.reduce((sum, confidence) => sum + confidence, 0) /
                confidences.length
              ).toFixed(1)
            )
          : null,
        answerCount: report.answerCount,
        topThemes,
      };
      const nextHistory = appendPrepHistoryEntry(existing, entry);
      localStorage.setItem(historyKey, JSON.stringify(nextHistory));
      window.dispatchEvent(
        new CustomEvent("adaptive-prep-history-updated", {
          detail: { key: historyKey },
        })
      );
    }

    setCompleted(true);
  }

  function previousQuestion() {
    if (currentIndex === 0) return;
    setCurrentIndex((index) => index - 1);
  }

  function resetSession() {
    if (companyId && personaId) {
      const key = getMockSessionStorageKey(companyId, personaId);
      localStorage.removeItem(key);
      window.dispatchEvent(
        new CustomEvent("adaptive-mock-session-updated", { detail: { key } })
      );
    }
    setStarted(false);
    setCompleted(false);
    setCurrentIndex(0);
    setAnswers([]);
    setConfidences([]);
    setQuestionOrder([]);
    setCopyState("idle");
    setLoadedFromDraft(false);
    setTimerRunning(false);
    setTimerRemaining(timerDuration);
  }

  function toggleTimer() {
    if (timerRemaining === 0) {
      setTimerRemaining(timerDuration);
      setTimerRunning(true);
      return;
    }
    setTimerRunning((prev) => !prev);
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimerRemaining(timerDuration);
  }

  async function copyReport() {
    try {
      const copied = await copyTextToClipboard(reportText);
      setCopyState(copied ? "copied" : "error");
    } catch {
      setCopyState("error");
    } finally {
      setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  function downloadReport() {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeCompany = (companyId ?? "general").replace(/[^a-z0-9-]/gi, "-");
    const safePersona = (personaId ?? "persona").replace(/[^a-z0-9-]/gi, "-");
    link.href = url;
    link.download = `interview-prep-${safeCompany}-${safePersona}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!script || !sessionQuestions.length) return null;

  if (!started) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">5-question mock session</h3>
          </div>
          <Badge variant="muted" className="text-[10px]">
            {interviewTimeline.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Practice live answers for this persona. You will get local feedback on
          structure, metrics, impact framing, and governance signals.
        </p>
        <div className="rounded-md border border-border bg-background p-3 space-y-1">
          <p className="text-xs font-medium">Recommended rehearsal mode</p>
          <p className="text-xs text-muted-foreground">
            {isInterviewSoon
              ? "Interview is close. Run pressure mode first, then replay your weakest answer once."
              : "Use standard mode to build answer structure, then switch to pressure for final reps."}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => setSessionMode(recommendedMode)}
          >
            Use recommended mode ({recommendedMode})
          </Button>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium">Session mode</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSessionMode("standard")}
              className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                sessionMode === "standard"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Standard (90s default)
            </button>
            <button
              type="button"
              onClick={() => setSessionMode("pressure")}
              className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                sessionMode === "pressure"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Pressure (60s forced)
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Pressure mode uses a fixed 60-second timer to simulate high-tempo interview rounds.
          </p>
        </div>
        {loadedFromDraft && (
          <p className="text-xs text-muted-foreground">
            Saved draft found for this interviewer mode.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {loadedFromDraft ? (
            <Button size="sm" onClick={() => setStarted(true)}>
              Continue saved draft
            </Button>
          ) : (
            <Button size="sm" onClick={startSession}>
              Start mock session
            </Button>
          )}
          {loadedFromDraft && (
            <Button size="sm" variant="outline" onClick={resetSession}>
              Clear saved draft
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Session complete
          </h3>
          <Badge variant="outline">
            Average score: {report.averageScore}/100
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Average confidence:{" "}
          {confidences.length
            ? (
                confidences.reduce((sum, confidence) => sum + confidence, 0) /
                confidences.length
              ).toFixed(1)
            : "N/A"}
          /5
        </p>
        <Badge variant="muted" className="text-[10px] uppercase w-fit">
          Mode: {sessionMode}
        </Badge>

        <div className="space-y-3">
          {sessionQuestions.map((question, index) => {
            const feedback = report.feedbackByQuestion[index];
            return (
              <div key={question.question} className="rounded-md border border-border p-3">
                <p className="text-xs font-medium">
                  Q{index + 1}. {question.question}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Score: {feedback?.score ?? 0}/100
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Confidence: {confidences[index] ?? 3}/5
                </p>
                {feedback?.gaps.length ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Next improvement: {feedback.gaps[0]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs font-medium">Coaching prompt</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {report.feedbackByQuestion[report.feedbackByQuestion.length - 1]
              ?.coachingPrompt ??
              "Re-run the session and tighten each answer with context-action-result."}
          </p>
        </div>

        <div className="rounded-md border border-border bg-background p-3 space-y-2">
          <p className="text-xs font-medium">Priority coaching themes</p>
          {coachingThemes.length ? (
            <ul className="space-y-1">
              {coachingThemes.map(([theme, count]) => (
                <li key={theme} className="text-xs text-muted-foreground">
                  • {theme} ({count} prompt{count > 1 ? "s" : ""})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Great baseline. Keep polishing concise impact statements.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={resetSession}>
            Run again
          </Button>
          <Button size="sm" variant="ghost" onClick={copyReport}>
            {copyState === "copied" ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied report
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy report
              </>
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={downloadReport}>
            <Download className="h-3.5 w-3.5" />
            Download report
          </Button>
        </div>
        {copyState === "error" && (
          <p className="text-xs text-muted-foreground">
            Could not copy automatically. Use the download option instead.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          This session report is saved locally for this company/persona mode.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Mock session in progress</h3>
        <div className="flex items-center gap-2">
          <Badge variant="muted">
            Question {currentIndex + 1} / {sessionQuestions.length}
          </Badge>
          <Badge variant="outline" className="text-[10px] uppercase">
            {sessionMode}
          </Badge>
        </div>
      </div>

      <div className="rounded-md border border-border bg-background p-3 space-y-2">
        <p className="text-sm font-medium">{currentQuestion.question}</p>
        <p className="text-xs text-muted-foreground">
          Testing: {currentQuestion.whatTheyAreTesting}
        </p>
        <p className="text-xs text-muted-foreground">
          Strategy: {currentQuestion.answerStrategy}
        </p>
        {currentQuestion.recommendedArtifact ? (
          <div className="inline-flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">
              {currentQuestion.recommendedArtifact.kind}
            </Badge>
            <Link
              href={currentQuestion.recommendedArtifact.url}
              className="text-xs text-primary hover:underline"
            >
              Review {currentQuestion.recommendedArtifact.title}
            </Link>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium" htmlFor="mock-answer">
          Your answer draft
        </label>
        <Textarea
          id="mock-answer"
          rows={6}
          value={currentAnswer}
          onChange={(event) => updateCurrentAnswer(event.target.value)}
          placeholder="Write your spoken answer draft here..."
          maxLength={3000}
        />
      </div>

      <div className="rounded-md border border-border bg-background p-3 space-y-1">
        <p className="text-xs font-medium">Answer pacing</p>
        <p className="text-xs text-muted-foreground">
          Word count: {currentWordCount} · Estimated speaking time:{" "}
          {currentSpeechSeconds}s at ~140 wpm
        </p>
        <p className="text-xs text-muted-foreground">
          Target: ~45–90 seconds for most answers.
        </p>
      </div>

      <div className="rounded-md border border-border bg-background p-3 space-y-2">
        <p className="text-xs font-medium">Confidence rating</p>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => updateCurrentConfidence(value)}
              aria-pressed={currentConfidence === value}
              className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                currentConfidence === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Rate how confident you would feel giving this answer live (1–5).
        </p>
      </div>

      <div className="rounded-md border border-border bg-background p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium">Live answer timer</p>
          <select
            value={timerDuration}
            onChange={(event) => setTimerDuration(Number(event.target.value) || 90)}
            className="h-7 rounded border border-border bg-background px-2 text-xs"
            aria-label="Select answer timer duration"
            disabled={sessionMode === "pressure"}
          >
            <option value={60}>60s</option>
            <option value={90}>90s</option>
            <option value={120}>120s</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={timerRemaining === 0 ? "default" : "outline"}
            className="font-mono"
          >
            {formatSeconds(timerRemaining)}
          </Badge>
          <Button size="sm" variant="ghost" onClick={toggleTimer}>
            {timerRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                {timerRemaining === 0 ? "Restart" : "Start"}
              </>
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={resetTimer}>
            Reset timer
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use this to simulate concise live responses.{" "}
          {timerRemaining === 0
            ? "Time is up — wrap with your impact statement."
            : isInterviewSoon
              ? "Interview is near. Prioritize concise impact closes and clear ownership language."
            : sessionMode === "pressure"
              ? "Pressure mode locks timer to 60 seconds. Aim for clarity and impact."
              : "Aim to close with impact before the timer ends."}
        </p>
      </div>

      <div className="rounded-md border border-border bg-background p-3 space-y-2">
        <p className="text-xs font-medium">Live feedback ({currentFeedback.score}/100)</p>
        {currentFeedback.strengths.length ? (
          <ul className="space-y-1">
            {currentFeedback.strengths.map((strength) => (
              <li key={strength} className="text-xs text-muted-foreground">
                ✅ {strength}
              </li>
            ))}
          </ul>
        ) : null}
        {currentFeedback.gaps.length ? (
          <ul className="space-y-1">
            {currentFeedback.gaps.map((gap) => (
              <li key={gap} className="text-xs text-muted-foreground">
                • {gap}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={previousQuestion}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <Button size="sm" onClick={nextQuestion}>
          {currentIndex >= sessionQuestions.length - 1 ? "Finish session" : "Next"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={resetSession}>
          Reset
        </Button>
      </div>
    </div>
  );
}
