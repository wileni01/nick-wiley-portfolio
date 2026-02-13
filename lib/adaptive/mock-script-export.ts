import type { MockInterviewerScript } from "./mock-interviewer";

interface BuildMockScriptMarkdownInput {
  generatedAt: string;
  companyName: string;
  personaName: string;
  personaRole: string;
  script: MockInterviewerScript;
}

export function buildMockScriptMarkdown(
  input: BuildMockScriptMarkdownInput
): string {
  const prompts = input.script.prompts
    .map((prompt, index) => {
      const artifactLine = prompt.recommendedArtifact
        ? `Recommended artifact: [${prompt.recommendedArtifact.title}](${prompt.recommendedArtifact.url})`
        : "Recommended artifact: (none)";

      return `${index + 1}. ${prompt.question}
   - Testing: ${prompt.whatTheyAreTesting}
   - Answer strategy: ${prompt.answerStrategy}
   - ${artifactLine}`;
    })
    .join("\n");

  return `# Mock Interviewer Script

Generated: ${input.generatedAt}
Company: ${input.companyName}
Persona: ${input.personaName} (${input.personaRole})

## Script
${prompts}
`;
}
