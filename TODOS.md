# ChallengeHub.de Todos

Stand: 2026-07-25

## Active

- [ ] ChallengeHub in kontinuierlichen, kleinen und verifizierten Arbeitsschleifen weiterentwickeln; pro Schleife Kontext/Todos pruefen, genau einen priorisierten Slice umsetzen, Lint/Build/Tests ausfuehren und Ergebnis sowie naechsten Schritt dokumentieren.
- [ ] SEO als feste Architektur- und Abnahmeanforderung fuer alle Web-Slices sichern: serverseitig crawlbare Inhalte, stabile sprechende URLs, eindeutige Metadata/Canonical, strukturierte Daten, Sitemap/robots, interne Verlinkung, Core-Web-Vitals-orientierte Performance und keine Abhaengigkeit von der spaeteren Mobile-App fuer indexierbare Inhalte.
  - [x] Kuratierte und veröffentlichte Community-Challenge-Detailseiten um kanonische `BreadcrumbList`-Strukturdaten für Startseite, Katalog und Detailseite ergänzen.
  - [x] Challenge-Katalog mit eindeutigem Canonical, Open-Graph-URL und serverseitiger `ItemList` für kuratierte sowie veröffentlichte Detailseiten auszeichnen.
  - [x] Wissenskatalog mit eindeutigem Canonical, Open-Graph-URL und serverseitiger `ItemList` für alle crawlbaren Artikel auszeichnen.
  - [x] Wissensartikel um kanonische `BreadcrumbList`-Strukturdaten für Startseite, Wissenskatalog und Artikel ergänzen.
  - [x] Homepage mit eindeutigem Canonical, Open-Graph-URL sowie verknüpften
    `WebSite`-, `Organization`- und internen `SearchAction`-Strukturdaten auszeichnen.
- [x] Dynamische `robots.txt` und `sitemap.xml` mit kanonischen oeffentlichen URLs, privaten Ausschlusspfaden und automatischer Aufnahme veroeffentlichter Challenges bereitstellen.
- [ ] Skalierbaren modularen Monolithen vorbereiten: PostgreSQL mit versionierten Migrationen, getrennte Domain-/Datenzugriffsschicht und versionierte API fuer Next.js-Webseite sowie spaetere iOS-/Android-App; bestehende SEO-faehige Next.js-Weboberflaeche erhalten.
  - [x] Versionierte PostgreSQL-Ausgangsmigration fuer das bestehende Persistenzmodell samt Abfrageindizes und Migrationskonvention anlegen.
  - [x] Repository-Grenze fuer oeffentliche Challenge-Lesezugriffe zwischen Domain-/Anwendungscode und konkretem Datenbankzugriff einfuehren; SQLite als laufenden Adapter behalten.
  - [x] Weitere Account-, Teilnahme- und Schreibzugriffe schrittweise hinter fachliche Repository-Schnittstellen verschieben.
    - [x] Nutzerspezifische Teilnahme-, Detail- und Check-in-Lesezugriffe hinter ein `ParticipationReadRepository` verschieben.
    - [x] Oeffentliche Teilnahmezaehler und Ranking-Kandidaten hinter ein `ChallengeParticipationStatsRepository` verschieben.
    - [x] Check-in-Schreibzugriff mit Berechtigungs- und Idempotenzregeln hinter ein `CheckInWriteRepository` verschieben.
    - [x] Teilnahme-Start mit Challenge-Freigabe und Duplikatregel hinter ein `ParticipationWriteRepository` verschieben.
    - [x] Oeffentliche Challenge-Erstellung mit Slug-, Ersteller- und Freigaberegeln hinter ein `ChallengeWriteRepository` verschieben.
    - [x] Account- und Session-Zugriffe hinter ein `AccountSessionRepository` verschieben und Account-/Token-Konflikte atomar behandeln.
  - [x] Materialisierung kuratierter Challenges und des internen Systemnutzers hinter eine getestete Bootstrap-Repository-Grenze verschieben.
  - [x] Versionierte Read-API fuer oeffentliche Challenge-Daten als ersten Web-/App-Vertrag bereitstellen.
  - [x] Stabile Cursor-Pagination mit validiertem Limit fuer die oeffentliche `v1`-Challenge-Liste ergaenzen.
  - [x] PostgreSQL-Challenge-Level per Folgemigration an die bestehenden Domainwerte `User`, `Beginner`, `Advanced` und `Premium` angleichen.
  - [x] Asynchrone Repository-Grenze und getesteten PostgreSQL-Adapter fuer den oeffentlichen Challenge-Leseweg vorbereiten; SQLite als aktiven Runtime-Adapter behalten.
  - [x] Unveränderliche PostgreSQL-Migrationshistorie mit versionierter SHA-256-Prüfsummenliste und automatischem Drift-Test absichern.
- [ ] Native App spaeter mit Expo/React Native auf gemeinsamer Domainlogik und typisiertem API-Client aufbauen; Web-SEO bleibt Aufgabe der Next.js-Anwendung.
  - [x] Frameworkunabhängigen, typisierten Fetch-Client für Liste und Detail des
    öffentlichen `v1`-Challenge-Vertrags mit Laufzeitvalidierung vorbereiten.
- [x] Next.js-Rebuild von `https://challengehub.de/` planen.
- [x] Bestehenden GitHub-Stand pruefen und erste kleine Implementierungs-Slice definieren.
- [x] Erste Next.js-Slice umsetzen: App-Router-Scaffold, Startseite, Challenge-Uebersicht, Navigation, Footer und UI-Modals mit statischen Daten.
- [x] Challenge-Kacheln optisch enger an die bestehende Website angleichen.
- [x] Challenge-Suche und Sortierung nach Erstellungsdatum ergaenzen.
- [x] Challenge-Detailseiten mit klickbaren Kacheln umsetzen.
- [x] Challenge-Detailseiten fuer SEO und Sharing optimieren.
- [x] Positive Effekte mit wissenschaftlichen Quellen, Plaene und Meta-Challenge ergaenzen.
- [x] Wissensdatenbank fuer Habit Rules und Gewohnheitsaufbau anlegen.
- [x] Footer-Seiten und Sicherheits-/Gesundheitshinweise anlegen.
- [x] Lokalen Teilnahme-MVP mit `Challenge starten`, Check-ins und `/meine-challenges` umsetzen.
- [x] Hero-Suche auf der Startseite mit Challenge-Liste koppeln.
- [x] Lokale oeffentliche Challenge-Erstellung mit Katalog, Detailseite, Start und Fortschritt umsetzen.
- [x] Account-Flow und serverseitig gespeicherte oeffentliche Challenges mit SQLite-Fundament umsetzen.
- [x] Startseiten-Layout nach Account-Slice bereinigen.
- [x] Challenge-Katalog von der Startseite auf `/challenges` auslagern.
- [x] Testdomain mit aktuellem Stand deployen.
- [x] Produktentscheidungen fuer Header, Profilmenue und Challenge Mate dokumentieren.
- [x] Segoe-UI-Typografie filigraner in die Next.js-App uebertragen.
- [x] Challenge-Katalog-Toolbar mit CTA und weissem Beginner-Text anpassen.
- [x] Detailseite `10.000 Schritte am Tag` auf simple Challenge, Ranking und Rechner umstellen.
- [x] Challenge-Detailseiten auf Standard-Reihenfolge Ranking, Q&A, Challenge Mate, Content umstellen.
- [x] Challenge-Detailseiten-Pulse-Grid, Community-Q&A, kompakte Ranking-Tabelle und Start-Popup verfeinern.
- [x] Alle Seitentypen auf gemeinsame Site-Shell und globale Layout-Tokens umstellen.
- [x] Fake-Q&A, Beispiel-Rankings und simulierte Mate-Daten von Challenge-Detailseiten entfernen.
- [x] Teilnahme-CTA auf allen Challenge-Detailseiten sichtbar im Hero platzieren.
- [x] Teilnahme-/Durchhaltewerte als kompakte Kennzahlen-Leiste unter dem Hero darstellen.
- [x] Challenge-Hero als neutrale 2/3-1/3-Flaeche mit Ranking neben dem CTA umsetzen.
- [x] Ranking im Hero als Tabelle mit echter lokaler Durchfuehrungsquote seit Start darstellen.
- [x] Pflichtenheft aus `challengehub-lastenheft.md` fuer die Umsetzung im bestehenden Projekt ableiten.
- [x] Produktentscheidungen fuer Server-MVP dokumentieren: 10.000 Schritte, Login-Popup, Check-in-Button, automatische Fehl-Tage, Challenge-Raum und Invite-Slice.
- [x] Server-MVP-Slice 1 umsetzen: Login-Popup, serverseitiger Start der 10.000-Schritte-Challenge, Challenge-Raum und heutiger Check-in.
- [x] Testdaten bereinigen und sichtbare Katalog-Kennzahlen auf echte Teilnehmerzahlen bzw. ehrliche Leerzustaende umstellen.
- [x] Login-Popup auf Challenge-Seiten optisch bereinigen.
- [x] Challenge-Detailseiten radikal vereinfachen: Hero, Regeln, Top-10-Ranking und SEO-Info; aktive Teilnahme nur fuer `10.000 Schritte am Tag`.
- [x] Challenge-Detailseiten optisch als kompakte Wettbewerbsseite mit Scoreboard-Hero, Ranking-Hauptmodul und Regeln-Nebenpanel nachschaerfen.
- [x] Detailseite `10.000 Schritte am Tag` weiter entschlacken: Hero-Text direkt unter die Headline, rechte Panels und Kennzahlen entfernen, Headlines auf maximal zwei Zeilen begrenzen.
- [x] Header-Login als Popup statt als direkte `/auth`-Navigation umsetzen.
- [x] Auth gegen Lastenheft nachziehen: Benutzernamen case-insensitiv eindeutig
  machen und Login per E-Mail-Adresse oder Benutzername ermöglichen.
- [x] Teilnahmeabsicht aus dem Challenge-CTA über Login oder Registrierung
  fortsetzen und eine geschützte Teilnahme-Bestätigungsseite anzeigen.
- [x] Teilnahme-Flow auf alle veröffentlichten kuratierten und selbst erstellten
  Community-Challenges erweitern.
- [x] Sichtbare deutsche Nutzertexte in App, Komponenten und Inhaltsdaten auf
  echte Umlaute und ß umstellen und mit einem Regressionstest absichern.
- [x] Aktive Teilnahme im Challenge-Raum mit Sicherheitsabfrage beenden,
  Verlauf archivieren und weitere Check-ins sowie Einladungen sperren.
- [x] Eingeloggtes Profilmenü und Katalog-Toolbar sauber ausrichten und mit
  einem visuellen E2E-Regressionstest absichern.
- [x] Passwort-Reset mit neutraler Anfrage, gehashtem 30-Minuten-Einmal-Token,
  sicherer Passwortänderung und Beendigung bestehender Sitzungen umsetzen.
- [x] Passwort-Reset gegen Timing-Enumeration und Versandmissbrauch härten:
  post-response Versand, persistente Limits pro E-Mail/IP und sichere Behandlung
  fehlgeschlagener Zustellungen.
- [x] Einladungsannahme auch für selbst erstellte Community-Challenges anbieten
  und mit einem vollständigen E2E-Test absichern.
- [ ] Resend-Zugang und Absenderadresse für den produktiven Versand der
  Passwort-Reset-E-Mails konfigurieren und mit einer echten Zustellung prüfen.
- [ ] `PASSWORD_RESET_RATE_LIMIT_SECRET` im Zielbetrieb als dauerhaftes Secret
  konfigurieren, damit HMAC-Identifier und Limits Neustarts stabil überstehen.

## Later

- [x] Lokale Entwicklung einrichten und dokumentieren.
- [x] Build-, Lint- und Preview-Verifikation etablieren.
- [ ] Footer-Seiten `/impressum`, `/karriere` und Datenschutz mit final freigegebenem Inhalt nachziehen.
- [x] Login, Registrierung, Challenge-Erstellung und Datenpersistenz fachlich klaeren.
- [x] Lokale Challenge-Erstellung spaeter auf Account-/Datenbankpersistenz umstellen.
- [x] Teilnahme-Flow fuer `Challenge starten` fachlich klaeren und fuer die erste Server-Challenge anbinden.
- [ ] Lokalen Teilnahme-MVP spaeter durch echte Auth-/Datenbankpersistenz ersetzen.
- [x] Echte serverseitige Teilnahme-, Check-in-, Streak- und Durchhaltequoten fuer Challenge-Seiten anbinden.
- [x] Server-MVP fuer 10.000-Schritte-Dauer-Challenge vervollstaendigen: Ranking aus serverseitigen Check-ins, Streak-Berechnung und persoenliche Rankingposition im Challenge-Raum.
- [x] LocalStorage-Fallback aus `/meine-challenges` entfernen und das Dashboard final nur mit serverseitigen Account-Daten betreiben.
- [x] Freund-herausfordern-Slice umsetzen: sichere Einladungstokens, teilbarer Link, Annahme nach Login/Registrierung und gemeinsames Ranking.
  - [x] Versioniertes Schema und Repository-Grenze fuer zeitlich begrenzte, widerrufbare Einladungen mit ausschliesslich gehashten Tokens anlegen.
  - [x] Sichere Token-Erzeugung und eingeloggte Erstellungsaktion im Challenge-Raum samt teilbarem Link umsetzen; Annahme-Flow danach separat.
  - [x] Einladungslink nach Login/Registrierung atomar annehmen, Selbstannahme verhindern und gemeinsames Ranking sichtbar machen.
- [ ] Challenge-Unterseiten bewusst schlank halten: Starten, Ranking, Challenge Mate, echter Aktivitaetsfeed und SEO-Infoteil; Reminder, Verlauf/Heatmap, persoenlicher Fortschritt und Freund-herausfordern gehoeren in `Meine Challenges`.
  - [x] Schlanken serverseitigen Aktivitaetsfeed aus den neuesten echten Check-ins mit ehrlichem Leerzustand auf kuratierten Challenge-Seiten anzeigen.
  - [x] Privaten 12-Wochen-Verlauf im Challenge-Raum aus echten Check-ins mit zugaenglicher Tagesstatus-Heatmap anzeigen.
  - [x] Aktiven Teilnahmen im privaten Challenge-Raum eine tägliche Kalender-Erinnerung als geschützten iCalendar-Download anbieten.
- [x] Header-Navigation anpassen: `Wissen` entfernen und eingeloggtes Profilmenue einbauen.
- [x] `Challenge Mate finden` als vorbereitete eingeloggte Route planen/umsetzen.
- [x] Challenge-Erstellung mit serverseitigem Abgleich gegen bestehende Titel, Slugs und aehnliche Challenges absichern und Treffer intern verlinken.
- [ ] Finale SEO-Texte, Keywords und echte Social-Preview-Bilder pro Challenge festlegen.
  - [x] Challenge-spezifische, serverseitig generierte 1200x630-Social-Preview-Bilder anbinden und Open Graph sowie Twitter auf ihre kanonischen Bildrouten verweisen lassen.
  - [x] Wissensartikel mit serverseitig generierten 1200x630-Social-Preview-Bildern und kanonischen Open-Graph-/Twitter-Verweisen ausstatten.
- [ ] Medizinische/gesundheitliche Disclaimer und sichere Teilnahmehinweise final abstimmen.
- [ ] Weitere Wissensartikel planen: Motivation, Streaks, Rueckfaelle, Identitaet, Umgebung, Tracking.
- [ ] Deployment-Strategie fuer VPS/Caddy mit Stefan abstimmen.
