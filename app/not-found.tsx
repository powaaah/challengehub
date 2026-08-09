import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { ActionLink, StatusPanel } from "@/components/ui";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Seite nicht gefunden | ChallengeHub",
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <>
      <SiteHeader user={null} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <StatusPanel
          tone="empty"
          label="404"
          title="Seite nicht gefunden"
          actions={
            <>
              <ActionLink href="/challenges">Challenges entdecken</ActionLink>
              <ActionLink href="/" variant="secondary">Zur Startseite</ActionLink>
            </>
          }
        >
          <p>
            Die aufgerufene Seite existiert nicht, wurde verschoben oder ist nicht mehr verfügbar.
          </p>
        </StatusPanel>
      </main>
      <SiteFooter />
    </>
  );
}
