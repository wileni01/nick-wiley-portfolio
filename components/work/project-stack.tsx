export function ProjectStack({ stack }: { stack: string[] }) {
  if (stack.length === 0) return null;

  return (
    <ul className="project-stack" aria-label="Tools and techniques">
      {stack.map((tool) => <li key={tool}>{tool}</li>)}
    </ul>
  );
}
