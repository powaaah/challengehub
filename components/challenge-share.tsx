"use client";

import { useRef, useState } from 'react';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import styles from './challenge-share.module.css';

type Props = { title: string; url: string; text: string; label: string };

export function ChallengeShare(props: Props) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>{props.label} ↗</button>
    {open && <ShareDialog {...props} onClose={() => setOpen(false)} />}
  </>;
}

function ShareDialog({ title, url, text, onClose }: Props & { onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const focus = useDialogFocus({ containerRef: dialogRef, initialFocusRef: fieldRef, onClose });
  const [message, setMessage] = useState('');
  const invitation = `${text}\n${url}`;
  async function copy() {
    try { await navigator.clipboard.writeText(invitation); setMessage('Herausforderung kopiert.'); }
    catch { fieldRef.current?.focus(); fieldRef.current?.select(); setMessage('Bitte kopiere den markierten Text manuell.'); }
  }
  async function share() {
    if (!navigator.share) { await copy(); return; }
    try { await navigator.share({ title, text, url }); }
    catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) setMessage('Teilen nicht möglich. Du kannst den Text kopieren.'); }
  }
  return <div className={styles.backdrop} onMouseDown={onClose}>
    <section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="share-title" onKeyDown={focus.onKeyDown} onMouseDown={event => event.stopPropagation()}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Teilen schließen">×</button>
      <h2 id="share-title">Fordere jemanden heraus</h2>
      <p>Teile deine Herausforderung mit einem Freund. Der Link führt zu dieser Challenge und ihren Regeln.</p>
      <label htmlFor="share-message">Deine Herausforderung</label>
      <textarea ref={fieldRef} id="share-message" readOnly value={invitation} rows={6} />
      <div className={styles.actions}><button type="button" onClick={copy}>Text und Link kopieren</button><button type="button" onClick={share}>Teilen …</button></div>
      <p role="status">{message}</p>
    </section>
  </div>;
}
