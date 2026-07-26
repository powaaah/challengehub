"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { startChallengeAction } from "@/app/challenges/[slug]/actions";
import { LoginModal } from "./login-modal";
import styles from "./challenge-start.module.css";

type ChallengeStartProps = {
  isAuthenticated: boolean;
  isAvailable?: boolean;
  loginNext: string;
  challenge: {
    slug: string;
    title: string;
    goal: string;
    duration: string;
    targetDays?: number;
  };
};

export function ChallengeStart({ challenge, isAuthenticated, isAvailable = true, loginNext }: ChallengeStartProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  if (!isAvailable) {
    return (
      <button className={styles.startButton} type="button" disabled>
        Bald verfügbar
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <form action={startChallengeAction}>
        <input type="hidden" name="slug" value={challenge.slug} />
        <StartButton />
      </form>
    );
  }

  return (
    <>
      <button className={styles.startButton} type="button" onClick={() => setIsLoginOpen(true)}>
        Jetzt teilnehmen
      </button>

      {isLoginOpen && (
        <LoginModal
          next={loginNext}
          onClose={() => setIsLoginOpen(false)}
          participationSlug={challenge.slug}
        />
      )}
    </>
  );
}

function StartButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.startButton} type="submit" disabled={pending}>
      {pending ? "Wird gestartet..." : "Jetzt teilnehmen"}
    </button>
  );
}
