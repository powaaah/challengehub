"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, registerAction } from "@/app/auth/actions";
import { INPUT_LIMITS } from "@/domain/security/input-limits";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import styles from "./login-modal.module.css";

const initialLoginState = {
  error: ""
};

type LoginModalProps = {
  next: string;
  onClose: () => void;
  participationSlug?: string;
  titleId?: string;
  kicker?: string;
  intro?: string;
};

export function LoginModal({
  next,
  onClose,
  participationSlug,
  titleId = "login-modal-title",
  kicker = "Login",
  intro = "Melde dich an, um deine Challenges und deinen Fortschritt zu speichern."
}: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginState, loginFormAction] = useActionState(loginAction, initialLoginState);
  const [registerState, registerFormAction] = useActionState(registerAction, initialLoginState);
  const dialogRef = useRef<HTMLElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const dialogFocus = useDialogFocus({ containerRef: dialogRef, initialFocusRef, onClose });
  const isRegister = mode === "register";
  const state = isRegister ? registerState : loginState;

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={dialogFocus.onKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className={styles.closeButton} type="button" aria-label="Anmeldedialog schließen" onClick={onClose}>
          x
        </button>
        <div className={styles.header}>
          <Image className={styles.logo} src="/logo.png" width={154} height={50} alt="ChallengeHub" />
          <p className={styles.kicker}>{isRegister ? "Registrierung" : kicker}</p>
          <h2 id={titleId}>{isRegister ? "Bei ChallengeHub registrieren" : "Bei ChallengeHub anmelden"}</h2>
          <p className={styles.intro}>
            {isRegister
              ? "Nach der Registrierung erhältst du einen Link zur Bestätigung deiner E-Mail-Adresse."
              : intro}
          </p>
        </div>
        <form className={styles.form} action={isRegister ? registerFormAction : loginFormAction}>
          <input type="hidden" name="next" value={next} />
          {participationSlug ? (
            <input type="hidden" name="participationSlug" value={participationSlug} />
          ) : null}
          {state.error && <p className={styles.error} role="alert">{state.error}</p>}
          {isRegister && (
            <label>
              <span>Benutzername</span>
              <input
                name="name"
                autoComplete="username"
                minLength={2}
                maxLength={30}
                spellCheck={false}
                required
              />
            </label>
          )}
          {isRegister ? (
            <label>
              <span>E-Mail-Adresse</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={INPUT_LIMITS.emailBytes}
                spellCheck={false}
                required
              />
            </label>
          ) : (
            <label>
              <span>E-Mail-Adresse oder Benutzername</span>
              <input
                ref={initialFocusRef}
                name="identifier"
                autoComplete="username"
                maxLength={INPUT_LIMITS.loginIdentifierBytes}
                spellCheck={false}
                required
              />
            </label>
          )}
          <label>
            <span>Passwort</span>
            <input
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : undefined}
              maxLength={INPUT_LIMITS.passwordBytes}
              required
            />
          </label>
          <SubmitButton mode={mode} />
        </form>
        {!isRegister ? (
          <>
            <Link className={styles.forgotLink} href="/auth/passwort-vergessen" onClick={onClose}>
              Passwort vergessen?
            </Link>
            <p className={styles.smallPrint}>
              Noch nicht bestätigt? Melde dich an und fordere im Profil einen neuen Link an.
            </p>
          </>
        ) : null}
        <p className={styles.smallPrint}>
          {isRegister ? "Schon registriert? " : "Noch nicht registriert? "}
          <button
            className={styles.switchButton}
            type="button"
            onClick={() => setMode(isRegister ? "login" : "register")}
          >
            {isRegister ? "Anmelden" : "Registrieren"}
          </button>
        </p>
      </section>
    </div>
  );
}

function SubmitButton({ mode }: { mode: "login" | "register" }) {
  const { pending } = useFormStatus();
  const isRegister = mode === "register";

  return (
    <button className={styles.submitButton} type="submit" disabled={pending}>
      {pending ? (isRegister ? "Erstellt Account..." : "Meldet an...") : isRegister ? "Account erstellen" : "Anmelden"}
    </button>
  );
}
