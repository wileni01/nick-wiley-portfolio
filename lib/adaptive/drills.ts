export interface TargetedDrill {
  id: string;
  theme: string;
  title: string;
  instruction: string;
  starterPrompt: string;
}

const themeDrillLibrary: Record<
  string,
  Omit<TargetedDrill, "id" | "theme">
> = {
  "Add concrete metrics": {
    title: "Metric layering drill",
    instruction:
      "Re-answer one question using at least one scale cue (volume, speed, or percentage).",
    starterPrompt:
      "In this project, the scale was ___ and the measurable improvement was ___.",
  },
  "Use stronger ownership language": {
    title: "Ownership verb drill",
    instruction:
      "Replace passive phrasing with strong first-person action verbs across your answer.",
    starterPrompt:
      "I led ___, designed ___, and delivered ___ under ___ constraints.",
  },
  "Close with clearer impact": {
    title: "Impact close drill",
    instruction:
      "End your answer with who benefited, what changed, and why it mattered.",
    starterPrompt:
      "The result was ___ for ___ stakeholders, which improved ___ decisions.",
  },
  "Include governance and safety framing": {
    title: "Governance framing drill",
    instruction:
      "Add one sentence on safeguards, auditability, and human override behavior.",
    starterPrompt:
      "We kept humans in control by ___, and logged ___ for audit review.",
  },
  "Add structured detail": {
    title: "CAR structure drill",
    instruction:
      "Use Context → Action → Result structure with one concise sentence each.",
    starterPrompt:
      "Context: ___. Action: ___. Result: ___.",
  },
};

const fallbackDrills: Array<Omit<TargetedDrill, "id" | "theme">> = [
  {
    title: "Decision-first framing drill",
    instruction:
      "Open with the decision being improved, then explain the system you built.",
    starterPrompt: "The decision we needed to improve was ___.",
  },
  {
    title: "Constraint narrative drill",
    instruction:
      "State one technical constraint and one governance constraint in each response.",
    starterPrompt:
      "The technical constraint was ___, and the governance constraint was ___.",
  },
  {
    title: "Executive-builder bridge drill",
    instruction:
      "Practice one sentence for executive outcomes and one for implementation detail.",
    starterPrompt:
      "Executive impact: ___. Builder detail: ___.",
  },
];

interface BuildDrillsInput {
  themes: string[];
}

export function buildTargetedDrills({
  themes,
}: BuildDrillsInput): TargetedDrill[] {
  const normalizedThemes = themes.filter(Boolean);

  if (!normalizedThemes.length) {
    return fallbackDrills.map((drill, index) => ({
      id: `fallback-${index + 1}`,
      theme: "General prep",
      ...drill,
    }));
  }

  const drills = normalizedThemes.map((theme, index) => {
    const template = themeDrillLibrary[theme] ?? themeDrillLibrary["Add structured detail"];
    return {
      id: `${theme.toLowerCase().replace(/\s+/g, "-")}-${index + 1}`,
      theme,
      ...template,
    };
  });

  return drills.slice(0, 3);
}
