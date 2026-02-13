"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useInterviewMode } from "./interview-mode-provider";
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

interface PersistedMockSession {
  answers: string[];
  currentIndex: number;
  completed: boolean;
  started: boolean;
  updatedAt: string;
}

function getSessionStorageKey(companyId: string, personaId: string) {
  return `adaptive.mock-session.${companyId}.${personaId}`;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function estimateSpeechSeconds(wordCount: number, wordsPerMinute = 140): number {
  if (!wordCount) return 0;
  return Math.round((wordCount / wordsPerMinute) * 60);
}

export function MockInterviewSession() {
  const { companyId, personaId } = useInterviewMode();
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [loadedFromDraft, setLoadedFromDraft] = useState(false);

  const script = useMemo(() => {
    if (!companyId || !personaId) return null;
    return buildMockInterviewerScript(companyId, personaId);
  }, [companyId, personaId]);

  const sessionQuestions = useMemo<SessionQuestion[]>(() => {
    if (!script) return [];
    return [warmupQuestion, ...script.prompts];
  }, [script]);

  const currentQuestion = sessionQuestions[currentIndex];
  const currentAnswer = answers[currentIndex] ?? "";
  const currentFeedback = evaluateMockAnswer(currentAnswer);
  const currentWordCount = countWords(currentAnswer);
  const currentSpeechSeconds = estimateSpeechSeconds(currentWordCount);
  const report = evaluateMockSession(answers.slice(0, sessionQuestions.length));
  const coachingThemes = useMemo(() => {
    return deriveCoachingThemes(report.feedbackByQuestion, 3);
  }, [report.feedbackByQuestion]);
  const reportText = useMemo(() => {
    const timestamp = new Date().toISOString();
    const header = [
      "Nick Wiley Interview Prep Report",
      `Generated: ${timestamp}`,
      `Mode: ${companyId ?? "general"} / ${personaId ?? "persona-not-set"}`,
      `Session: ${script.heading}`,
      `Average score: ${report.averageScore}/100`,
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
  }, [answers, companyId, personaId, report, script.heading, sessionQuestions]);

  useEffect(() => {
    if (!companyId || !personaId || !sessionQuestions.length) return;

    const storedRaw = localStorage.getItem(getSessionStorageKey(companyId, personaId));
    if (!storedRaw) return;

    try {
      const stored = JSON.parse(storedRaw) as PersistedMockSession;
      const normalizedAnswers = Array.from(
        { length: sessionQuestions.length },
        (_, index) => stored.answers[index] ?? ""
      );

      setAnswers(normalizedAnswers);
      setCurrentIndex(
        Math.max(0, Math.min(stored.currentIndex ?? 0, sessionQuestions.length - 1))
      );
      setCompleted(Boolean(stored.completed));
      setStarted(Boolean(stored.started));
      setLoadedFromDraft(Boolean(stored.started || stored.answers.some(Boolean)));
    } catch {
      localStorage.removeItem(getSessionStorageKey(companyId, personaId));
    }
  }, [companyId, personaId, sessionQuestions.length]);

  useEffect(() => {
    if (!companyId || !personaId) return;

    if (!started && answers.every((answer) => !answer.trim())) {
      localStorage.removeItem(getSessionStorageKey(companyId, personaId));
      return;
    }

    const payload: PersistedMockSession = {
      answers,
      currentIndex,
      completed,
      started,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      getSessionStorageKey(companyId, personaId),
      JSON.stringify(payload)
    );
  }, [answers, companyId, completed, currentIndex, personaId, started]);

  function startSession() {
    setAnswers(Array.from({ length: sessionQuestions.length }, () => ""));
    setCurrentIndex(0);
    setCompleted(false);
    setStarted(true);
    setLoadedFromDraft(false);
  }

  function updateCurrentAnswer(nextValue: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = nextValue;
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
      localStorage.removeItem(getSessionStorageKey(companyId, personaId));
    }
    setStarted(false);
    setCompleted(false);
    setCurrentIndex(0);
    setAnswers([]);
    setCopyState("idle");
    setLoadedFromDraft(false);
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopyState("copied");
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
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">5-question mock session</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Practice live answers for this persona. You will get local feedback on
          structure, metrics, impact framing, and governance signals.
        </p>
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
          <Badge variant="outline">Average score: {report.averageScore}/100</Badge>
        </div>

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
        <Badge variant="muted">
          Question {currentIndex + 1} / {sessionQuestions.length}
        </Badge>
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
