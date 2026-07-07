"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/auth/actions";
import { startChallengeAction } from "@/app/challenges/[slug]/actions";
import styles from "./challenge-start.module.css";

type ChallengeStartProps = {
  isAuthenticated: boolean;
  loginNext: string;
  challenge: {
    slug: string;
    title: string;
    goal: string;
    duration: string;
    targetDays?: number;
  };
};

const initialLoginState = {
  error: ""
};

export function ChallengeStart({ challenge, isAuthenticated, loginNext }: ChallengeStartProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginState, loginFormAction] = useActionState(loginAction, initialLoginState);

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
        <div className={styles.backdrop} role="presentation" onMouseDown={() => setIsLoginOpen(false)}>
          <section
            className={`${styles.modal} ${styles.loginModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-challenge-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className={styles.closeButton} type="button" onClick={() => setIsLoginOpen(false)}>
              x
            </button>
            <Image className={styles.modalLogo} src="/logo.png" width={154} height={50} alt="ChallengeHub" />
            <p className={styles.kicker}>Teilnahme freischalten</p>
            <h2 id="login-challenge-title">Bei ChallengeHub anmelden</h2>
            <p className={styles.loginIntro}>
              Melde dich an, um an {challenge.title} teilzunehmen und deinen Fortschritt unter Meine Challenges
              zu speichern.
            </p>
            <form className={styles.loginForm} action={loginFormAction}>
              <input type="hidden" name="next" value={loginNext} />
              {loginState.error && <p className={styles.error}>{loginState.error}</p>}
              <label>
                <span>E-Mail-Adresse</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label>
                <span>Passwort</span>
                <input name="password" type="password" autoComplete="current-password" required />
              </label>
              <LoginButton />
            </form>
            <p className={styles.smallPrint}>
              Noch nicht registriert? <Link href={`/auth?next=${encodeURIComponent(loginNext)}`}>Registrieren</Link>
              {" oder "}
              <Link href={`/auth?next=${encodeURIComponent(loginNext)}`}>Passwort vergessen?</Link>
            </p>
          </section>
        </div>
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

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.loginButton} type="submit" disabled={pending}>
      {pending ? "Meldet an..." : "Anmelden"}
    </button>
  );
}
