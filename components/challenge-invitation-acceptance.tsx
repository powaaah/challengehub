"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { acceptInvitationAction } from "@/app/challenges/[slug]/actions";
import { LoginModal } from "./login-modal";
import styles from "./challenge-invitation-acceptance.module.css";

type Props = {
  isAuthenticated: boolean;
  slug: string;
  token: string;
};

export function ChallengeInvitationAcceptance({ isAuthenticated, slug, token }: Props) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const next = `/challenges/${slug}?einladung=${encodeURIComponent(token)}`;

  return (
    <section className={styles.panel} aria-labelledby="invitation-title">
      <div>
        <p className={styles.kicker}>Persönliche Einladung</p>
        <h2 id="invitation-title">Gemeinsam in diese Challenge starten</h2>
        <p>Nimm die Einladung an und tritt mit deinem Freund im selben echten Ranking an.</p>
      </div>
      {isAuthenticated ? (
        <form action={acceptInvitationAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="token" value={token} />
          <AcceptButton />
        </form>
      ) : (
        <button className={styles.button} type="button" onClick={() => setIsLoginOpen(true)}>
          Anmelden und Einladung annehmen
        </button>
      )}
      {isLoginOpen ? (
        <LoginModal
          next={next}
          onClose={() => setIsLoginOpen(false)}
          kicker="Einladung"
          intro="Melde dich an oder registriere dich. Danach kannst du die Einladung sicher annehmen."
        />
      ) : null}
    </section>
  );
}

function AcceptButton() {
  const { pending } = useFormStatus();
  return (
    <button className={styles.button} type="submit" disabled={pending}>
      {pending ? "Einladung wird angenommen ..." : "Einladung annehmen"}
    </button>
  );
}
