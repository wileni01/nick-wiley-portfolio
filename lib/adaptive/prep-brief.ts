export interface PrepBriefInput {
  generatedAt: string;
  companyName: string;
  personaName: string;
  personaRole: string;
  personaGoal: string;
  focusNote?: string;
  prepNotes?: string;
  readiness: {
    completed: number;
    total: number;
    percentage: number;
  };
  latestScore: number | null;
  latestConfidence: number | null;
  preflight?: {
    score: number;
    label: string;
    detail: string;
  };
  topResources: Array<{
    title: string;
    url: string;
    reason: string;
  }>;
  talkingPoints: string[];
  reminders?: Array<{
    title: string;
    detail: string;
    dueBy: string;
    priority: "high" | "medium" | "low";
  }>;
}

export interface PrepPacketInput extends PrepBriefInput {
  nextActions: Array<{
    priority: "high" | "medium" | "low";
    title: string;
    detail: string;
  }>;
  drills: Array<{
    theme: string;
    title: string;
    instruction: string;
    starterPrompt: string;
  }>;
  dayPlan: {
    title: string;
    blocks: Array<{
      phase: string;
      objective: string;
      action: string;
    }>;
    fallbackPrompt: string;
  } | null;
}

export function buildPrepBriefMarkdown(input: PrepBriefInput): string {
  const resourceLines = input.topResources.length
    ? input.topResources
        .map(
          (resource, index) =>
            `${index + 1}. [${resource.title}](${resource.url}) — ${resource.reason}`
        )
        .join("\n")
    : "- No resources available yet.";

  const talkingPointLines = input.talkingPoints.length
    ? input.talkingPoints.map((point) => `- ${point}`).join("\n")
    : "- No talking points generated.";

  return `# Interview Prep Brief

Generated: ${input.generatedAt}

## Target
- Company: ${input.companyName}
- Interviewer: ${input.personaName} (${input.personaRole})

## Role Focus
${input.personaGoal}

## Session Focus Note
${input.focusNote?.trim() ? input.focusNote : "No additional focus note set."}

## Prep Notes
${input.prepNotes?.trim() ? input.prepNotes : "No prep notes captured."}

## Readiness Snapshot
- Checklist: ${input.readiness.completed}/${input.readiness.total} (${input.readiness.percentage}%)
- Latest mock-session score: ${input.latestScore ?? "N/A"}
- Latest confidence rating: ${
    input.latestConfidence !== null ? `${input.latestConfidence}/5` : "N/A"
  }
${input.preflight ? `- Preflight: ${input.preflight.score}/100 (${input.preflight.label})` : ""}

## Recommended Resources (open first)
${resourceLines}

## Talking Points
${talkingPointLines}

## Practice Reminders
${
  input.reminders?.length
    ? input.reminders
        .map(
          (reminder, index) =>
            `${index + 1}. [${reminder.priority.toUpperCase()} · due ${reminder.dueBy}] ${reminder.title} — ${reminder.detail}`
        )
        .join("\n")
    : "- No reminders generated."
}
`;
}

export function buildPrepPacketMarkdown(input: PrepPacketInput): string {
  const brief = buildPrepBriefMarkdown(input).trim();

  const nextActionsSection = input.nextActions.length
    ? input.nextActions
        .map(
          (action, index) =>
            `${index + 1}. [${action.priority.toUpperCase()}] ${action.title} — ${action.detail}`
        )
        .join("\n")
    : "- No next actions generated.";

  const drillsSection = input.drills.length
    ? input.drills
        .map(
          (drill, index) =>
            `${index + 1}. ${drill.title} (${drill.theme})\n   - ${drill.instruction}\n   - Starter: ${drill.starterPrompt}`
        )
        .join("\n")
    : "- No targeted drills available.";

  const dayPlanSection = input.dayPlan
    ? [
        `### ${input.dayPlan.title}`,
        ...input.dayPlan.blocks.map(
          (block, index) =>
            `${index + 1}. **${block.phase} — ${block.objective}**\n   ${block.action}`
        ),
        `Fallback: ${input.dayPlan.fallbackPrompt}`,
      ].join("\n")
    : "No day plan available for this mode.";

  return `${brief}

## Next Best Actions
${nextActionsSection}

## Targeted Drills
${drillsSection}

## Interview Day Plan
${dayPlanSection}
`;
}
