import { pageContent } from "@/data/pages.generated";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import styles from "../legal-pages.module.css";

export const metadata: Metadata = {
  title: "Impressum | ChallengeHub",
  description: "Anbieterkennzeichnung für ChallengeHub.",
  alternates: {
    canonical: "/impressum"
  },
  robots: {
    index: false,
    follow: true
  }
};

export const dynamic = "force-dynamic";

export default async function ImpressumPage() {
  const copy = pageContent.impressum;
  const user = await getCurrentUser();

  return (
    <>
    <SiteHeader user={user} />
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.content}>
        <p className={styles.kicker}>{copy["rechtliches"]}</p>
        <h1>{copy["impressum"]}</h1>
        <p className={styles.intro}>{copy["diese-seite-ist-als-struktur-fur"]}</p>

        <div className={styles.warning}>
          <h2>{copy["vor-livegang-ausfullen"]}</h2>
          <p>{copy["nach-ddg-5-mussen-relevante-anbieterangaben"]}</p>
        </div>

        <div className={styles.panel}>
          <h2>{copy["anbieter"]}</h2>
          <div className={styles.placeholder}>
            <code>{copy["name-firma"]}</code>
            <span>{copy["anbieter-name"]}</span>
            <code>{copy["anschrift"]}</code>
            <span>{copy["anbieter-anschrift"]}</span>
            <code>{copy["vertretungsberechtigte-person-falls-zutreffend"]}</code>
            <span>{copy["anbieter-vertretung"]}</span>
          </div>

          <h3>{copy["kontakt"]}</h3>
          <div className={styles.placeholder}>
            <code>{copy["e-mail"]}</code>
            <span>{copy["anbieter-email"]}</span>
            <code>{copy["telefon-falls-erforderlich-gewunscht"]}</code>
            <span>{copy["anbieter-telefon"]}</span>
          </div>

          <h3>{copy["weitere-angaben-falls-zutreffend"]}</h3>
          <ul>
            <li>{copy["umsatzsteuer-id-oder-wirtschafts-id"]}</li>
            <li>{copy["registereintrag"]}</li>
            <li>{copy["zustandige-aufsichtsbehorde"]}</li>
            <li>{copy["berufsrechtliche-angaben"]}</li>
            <li>{copy["angaben-zur-verbraucherstreitbeilegung"]}</li>
          </ul>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
