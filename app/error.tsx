"use client";

import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { ActionLink, Button, StatusPanel } from "@/components/ui";
import styles from "./route-state.module.css";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <SiteHeader user={null} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <StatusPanel
          tone="error"
          title="Das hat nicht funktioniert"
          actions={
            <>
              <Button onClick={reset}>Erneut versuchen</Button>
              <ActionLink href="/" variant="secondary">Zur Startseite</ActionLink>
            </>
          }
        >
          <p>Beim Laden der Seite ist ein unerwarteter Fehler aufgetreten.</p>
        </StatusPanel>
      </main>
      <SiteFooter />
    </>
  );
}
