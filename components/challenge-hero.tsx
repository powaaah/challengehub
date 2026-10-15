import Image from "next/image";
import Link from "next/link";
import { ChallengeStart } from "./challenge-start";
import { challengeHeaders } from "@/data/challenge-headers";
import styles from "./challenge-hero.module.css";

type Props = {
  challenge: { slug: string; title: string; goal: string; description: string; rules: string[]; duration: string; targetDays?: number };
  isAuthenticated: boolean;
  currentParticipationId?: string;
  participantCount: number;
};

export function ChallengeHero({ challenge, isAuthenticated, currentParticipationId, participantCount }: Props) {
  const content = challengeHeaders[challenge.slug];
  return (
    <section className={`${styles.hero} ${content ? "" : styles.withoutImage}`} data-detail-section="hero">
      <div className={styles.copy}>
        <Link className={styles.back} href="/challenges">← Alle Challenges</Link>
        <p className={styles.eyebrow}>Deine nächste Herausforderung</p>
        <h1>{challenge.title}</h1>
        <p className={styles.summary}>{content?.summary ?? `${challenge.goal} ${challenge.rules.slice(0, 2).join(" ")}`}</p>
        <div className={styles.actions}>
          {currentParticipationId ? (
            <Link className={styles.primary} href={`/meine-challenges/${currentParticipationId}`}>Zum Challenge-Raum</Link>
          ) : (
            <ChallengeStart challenge={challenge} isAuthenticated={isAuthenticated} loginNext={`/challenges/${challenge.slug}`} />
          )}
          <Link className={styles.secondary} href="/challenge-mate">ChallengeMate finden ↗</Link>
        </div>
        <p className={styles.meta}>{participantCount} Teilnehmer <span aria-hidden="true">·</span> {challenge.duration}</p>
        <details className={styles.rules}>
          <summary>Vollständige Regeln</summary>
          {!content && <p>{challenge.description}</p>}
          <ol>{challenge.rules.map(rule => <li key={rule}>{rule}</li>)}</ol>
        </details>
      </div>
      {content && (
        <figure className={styles.visual}>
          <Image src={`/images/challenges/${content.image}.jpg`} alt={content.alt} fill sizes="(max-width: 760px) 100vw, 50vw" priority />
          <figcaption><strong>{content.highlight}</strong><span>{content.caption}</span></figcaption>
        </figure>
      )}
    </section>
  );
}
