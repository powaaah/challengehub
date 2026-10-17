import { Fragment } from "react";

function inline(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link && (/^https?:\/\//.test(link[2]) || /^\/(?!\/)/.test(link[2])))
        return (
          <a key={index} href={link[2]}>
            {link[1]}
          </a>
        );
      return <Fragment key={index}>{part}</Fragment>;
    });
}
// Deliberately no HTML/MDX execution. Supported editorial subset: headings,
// paragraphs, bullet lists, bold text and http(s)/same-site links.
export function ChallengeMarkdown({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((block, index) => {
          if (block.startsWith("### "))
            return <h3 key={index}>{inline(block.slice(4))}</h3>;
          if (block.startsWith("## "))
            return (
              <h2 key={index} id={index === 0 ? "challenge-info" : undefined}>
                {inline(block.slice(3))}
              </h2>
            );
          if (block.split("\n").every((line) => line.startsWith("- ")))
            return (
              <ul key={index}>
                {block.split("\n").map((line, i) => (
                  <li key={i}>{inline(line.slice(2))}</li>
                ))}
              </ul>
            );
          return <p key={index}>{inline(block)}</p>;
        })}
    </>
  );
}
