export interface PrepBriefInput {
  generatedAt: string;
  companyName: string;
  personaName: string;
  personaRole: string;
  personaGoal: string;
  readiness: {
    completed: number;
    total: number;
    percentage: number;
  };
  latestScore: number | null;
  latestConfidence: number | null;
  topResources: Array<{
    title: string;
    url: string;
    reason: string;
  }>;
  talkingPoints: string[];
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

## Readiness Snapshot
- Checklist: ${input.readiness.completed}/${input.readiness.total} (${input.readiness.percentage}%)
- Latest mock-session score: ${input.latestScore ?? "N/A"}
- Latest confidence rating: ${
    input.latestConfidence !== null ? `${input.latestConfidence}/5` : "N/A"
  }

## Recommended Resources (open first)
${resourceLines}

## Talking Points
${talkingPointLines}
`;
}
