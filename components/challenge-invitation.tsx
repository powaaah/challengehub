"use client";

import { useActionState, useState } from "react";
import {
  createInvitationAction,
  type CreateInvitationState
} from "@/app/meine-challenges/[id]/actions";
import styles from "./challenge-invitation.module.css";

const initialState: CreateInvitationState = {
  status: "idle",
  message: ""
};

export function ChallengeInvitation({ participationId }: { participationId: string }) {
  const [state, formAction, pending] = useActionState(createInvitationAction, initialState);
  const [copied, setCopied] = useState(false);

  async function copyInviteUrl() {
    if (!state.inviteUrl) return;
    await navigator.clipboard.writeText(state.inviteUrl);
    setCopied(true);
  }

  return (
    <section className={styles.panel} aria-labelledby="challenge-invitation-title">
      <p className={styles.kicker}>Gemeinsam dranbleiben</p>
      <h2 id="challenge-invitation-title">Freund herausfordern</h2>
      <p>
        Erstelle einen persönlichen Link für diese Challenge. Der Link ist sieben Tage gültig.
      </p>

      <form action={formAction}>
        <input type="hidden" name="participationId" value={participationId} />
        <button className={styles.createButton} type="submit" disabled={pending}>
          {pending ? "Link wird erstellt ..." : "Einladungslink erstellen"}
        </button>
      </form>

      {state.status === "success" && state.inviteUrl ? (
        <div className={styles.result} aria-live="polite">
          <label htmlFor="challenge-invite-url">Dein Einladungslink</label>
          <div className={styles.copyRow}>
            <input id="challenge-invite-url" readOnly value={state.inviteUrl} />
            <button type="button" onClick={copyInviteUrl}>
              {copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
          <p>{state.message}</p>
        </div>
      ) : null}

      {state.status === "error" ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
