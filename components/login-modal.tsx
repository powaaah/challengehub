"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/auth/actions";
import styles from "./login-modal.module.css";

const initialLoginState = {
  error: ""
};

type LoginModalProps = {
  next: string;
  onClose: () => void;
  titleId?: string;
  kicker?: string;
  intro?: string;
};

export function LoginModal({
  next,
  onClose,
  titleId = "login-modal-title",
  kicker = "Login",
  intro = "Melde dich an, um deine Challenges und deinen Fortschritt zu speichern."
}: LoginModalProps) {
  const [loginState, loginFormAction] = useActionState(loginAction, initialLoginState);

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className={styles.closeButton} type="button" aria-label="Anmeldedialog schliessen" onClick={onClose}>
          x
        </button>
        <div className={styles.header}>
          <Image className={styles.logo} src="/logo.png" width={154} height={50} alt="ChallengeHub" />
          <p className={styles.kicker}>{kicker}</p>
          <h2 id={titleId}>Bei ChallengeHub anmelden</h2>
          <p className={styles.intro}>{intro}</p>
        </div>
        <form className={styles.form} action={loginFormAction}>
          <input type="hidden" name="next" value={next} />
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
          Noch nicht registriert? <Link href={`/auth?next=${encodeURIComponent(next)}`}>Registrieren</Link>
          {" oder "}
          <Link href={`/auth?next=${encodeURIComponent(next)}`}>Passwort vergessen?</Link>
        </p>
      </section>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.submitButton} type="submit" disabled={pending}>
      {pending ? "Meldet an..." : "Anmelden"}
    </button>
  );
}
