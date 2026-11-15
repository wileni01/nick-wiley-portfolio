export function ProjectStack({ languages, stack }: { languages: string[]; stack: string[] }) {
  if (languages.length === 0 && stack.length === 0) return null;

  return (
    <dl className="project-stack">
      {languages.length > 0 && (
        <div>
          <dt>Languages</dt>
          <dd>{languages.join(" · ")}</dd>
        </div>
      )}
      {stack.length > 0 && (
        <div>
          <dt>Tools</dt>
          <dd>{stack.join(" · ")}</dd>
        </div>
      )}
    </dl>
  );
}
