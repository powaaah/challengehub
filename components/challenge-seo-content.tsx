import Link from "next/link";
import { ChallengeMarkdown } from './challenge-markdown';
import { buildChallengeSeoContent, type ChallengeSeoInput } from "@/lib/challenge-seo-content";
import styles from "./challenge-seo-content.module.css";

export function ChallengeSeoContent({ challenge, creatorName }: {
  challenge: ChallengeSeoInput;
  creatorName?: string;
}) {
  const content = buildChallengeSeoContent(challenge);
  return (
    <section className={styles.content} data-detail-section="seo" data-seo-version={content.version} aria-labelledby="challenge-info">
      <div>
        {challenge.seoMarkdown ? <ChallengeMarkdown text={challenge.seoMarkdown}/> : <>
        <h2 id="challenge-info">{content.heading}</h2>
        <p>{content.intro}</p>
        {content.sections.map((section) => (
          <div key={section.heading}>
            <h3>{section.heading}</h3>
            {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        ))}
        </>}
        {content.tips.length > 0 && (
          <div>
            <h3>Tipps für deinen Versuch</h3>
            <ul>{content.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </div>
        )}
        <p><Link href="/challenges">Weitere Challenges entdecken</Link></p>
        {creatorName && <p>Erstellt von {creatorName}</p>}
      </div>
      {content.faq.length > 0 && (
        <div>
          <h2>Häufige Fragen</h2>
          <dl>{content.faq.map((item) => (
            <div key={item.question}><dt>{item.question}</dt><dd>{item.answer}</dd></div>
          ))}</dl>
        </div>
      )}
    </section>
  );
}
