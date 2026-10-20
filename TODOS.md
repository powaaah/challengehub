# ChallengeHub.de Todos

Stand: 2026-10-17

## Persona-Grundlage

- [x] Fünf bestätigte Personas in `docs/personas.md` dokumentieren und im Agenten-Kontext verankern: Tim zuerst, Stefan knapp dahinter, ergänzt durch Melanie, Aylin und Matthias.
- [ ] Bei der nächsten Produktplanung bestehende Abläufe gegen die Personas prüfen und Sammel-Challenges fachlich konkretisieren.

## Active

- [x] Markdown als führende Quelle für die 17 kuratierten Challenges: Migration, Validierung, atomarer DB-Abgleich, Revisionen, Archivierung bei entfernten Dateien und Schutz vorhandener Wertungen. Build-/Start-Abgleich und sieben Browser-Tests erfolgreich. Anleitung: docs/challenge-markdown-backend.md. Mit PR #8 auf theovina.de veroeffentlicht; 15 Dateien nach bestaetigter Entfernung der Liegestuetz-Journey und 10.000-Kalorien-Challenge.

- [x] Leistungs-Challenges mit teilbarer Zeit-Herausforderung statt Mate-Zweitbutton umgesetzt; Liegestütz-Journey und 100 Tage Body Transformation angelegt. Bestzeit wird im Teiltext mit den Regeln verlinkt. Teilnahme, Kalendergrenze und Desktop/Mobil geprüft. Mit PR #7 veröffentlicht.
- [x] Body-Transformation-Wertung abgestimmt: Navy-KFA-Abnahme in Prozentpunkten über 100 Tage; ersetzt die vorläufige Tagesplanwertung und die zwischenzeitliche Entscheidung ohne Ranking. Details in docs/product-decisions.md.
- [x] Body Transformation gemäß bestätigtem Modell implementiert: Navy-Berechnung, tägliche Messwerthistorie, private Start-/Endbilder, Teil-Challenges und KFA-Ranking mit getrennten Zwischenständen/100-Tage-Ergebnissen. Export, Löschung, Zugriffsschutz und mobile Bedienung geprüft.
- [x] Autorisierten Navy-/Journey-Release über PR #7 auf theovina.de veröffentlicht: Backup und additive Migrationsprobe ohne Änderung vorhandener Datensätze; 268 Servertests, Lint/Build, sechs lokale E2E-Tests und neun Live-Layoutprüfungen plus www/Zugriffsschutz bestanden.

- [ ] Redaktionellen SEO-Lauf für „100 Liegestütze am Stück“ überarbeiten: Stefan hat `text-v2.txt` inhaltlich abgelehnt. Schwerpunkt Leistung, Zeit, Rekordvergleich und Regeln; Vorbereitung nur ein Faktor und Verweis zur Journey. Keine behaupteten Bevölkerungsperzentile. Schritt 4 teilweise: 18 sicher gemessene von 100 Kandidaten; Export-Einstellungen unbekannt. 30-Tage-Monitoring und programmierte KI-Orchestrierung offen.

- [x] Autorisierter Release von SEO-Workflow und Aktivitätenentfernung über PR #6 veröffentlicht; 258 Servertests, 21 SEO-Tests, Lint/Build und 15 Liveprüfungen bestanden.

- [x] Deterministischen SEO-Textgenerator für kuratierte und veröffentlichte Community-Challenges unter dem Ranking umgesetzt; 21 SEO-Tests, sechs Browserprüfungen, Lint und Build bestanden. Desktop/Mobil geprüft, Pflegeablauf in `docs/challenge-seo-workflow.md`. Über PR #6 veröffentlicht.

- [x] „Letzte Aktivitäten“ auf kuratierten und Community-Detailseiten einschließlich Datenabruf und ungenutzter Darstellung entfernt; zwölf Browserprüfungen, Desktop/Mobil, Lint und Build bestanden. Über PR #6 veröffentlicht.
- [x] Ranking-Podium und Erfolgswertung umgesetzt: rahmenlos, Gold/Silber/Bronze, Tabelle ab Platz 4 und eigene Position; bestätigte feste einmalige Ziele mit „geschafft + optionale Bestzeit“, tägliche/Sammel- und Dauerwertungen erhalten. Standardsilhouetten, Bestzeitspeicherung samt Export/Löschung, Verbesserungen nach Abschluss und Desktop/Mobil/Barrierefreiheit geprüft. Über PR #5 veröffentlicht.
- [x] Neues Ranking nach Stefans ausdrücklicher Deployment-Freigabe mit Backup und Migrationsprobe veröffentlicht: 255 Servertests, Lint/Build und zwölf Liveprüfungen bestanden; vorhandene Daten auch nach Aktivierung unverändert bestätigt.
- [ ] Profilbild-Upload als separaten Funktionsschritt abstimmen; das Ranking verwendet Standardsilhouetten.
- [x] Button-Grundfarbe auf Orange korrigiert und über PR #4 veröffentlicht; Normal-/Hoverzustand inklusive Raumlink, vier Theme-E2E-Tests und Liveprüfung bei 1440/390/320 px bestanden.
- [x] Orange Highlight-/Hoverfarben über PR #3 auf theovina.de veröffentlicht; 251 Servertests, Lint/Build sowie Liveprüfung bei 1440/390/320 px inklusive Hoverfarben bestanden.
- [x] Button-Hover passend zur Highlightfarbe auf Orange mit dunkler Schrift umgestellt; Lint, mobile/ Desktop-Themechecks und echte Hover-Farbprüfung bestanden.
- [x] Highlightfarbe auf `#ff8c00` mit passender dunkler Akzentfläche umgestellt; Lint, TypeScript, Build und öffentliche Seiten bei 390/1440 px inklusive Kontrastprüfung bestanden.
- [x] Challenge-Detailseiten: passende lokale Header-Fotos, kompakte Aufgabe/Regeln, Teilnahme im Header, alte Infokacheln entfernt; Desktop/Mobil und Dialoge geprüft.
- [x] 5-Minuten-Calisthenics-Challenge (50 Klimmzüge, danach 100 Liegestütze) mit Zeitwertung ergänzt; auf Stefans Wunsch ohne YouTube-Verweis.
- [x] Medienheader und neue Calisthenics-Challenge über PR #2 veröffentlicht; 251 Servertests, Build und 32 Live-Seitenprüfungen samt Bildern bestanden (16.10.2026).

- [x] Dunkles Referenztheme auf die gesamte Website übertragen: zentrale Farben, Header/Footer, Startseite/Katalog, Detailseiten, private Bereiche, Formulare und Statusmeldungen; Kontrast, Desktop/Mobil und bestehende Abläufe geprüft (61/61 E2E, Lint, TypeScript, Build bestanden).
- [x] Dunkles Theme von Stefan zur Veroeffentlichung freigegeben; Branch gepusht, PR #1 gemergt und auf theovina.de deployt. Servertests/Build und Livepruefung bei 1440/390/320 px bestanden (15.10.2026).
- [ ] Zentrale Verlaufssynchronisation nach Wiederverfuegbarkeit des Wissensspeichers nachholen.

- [x] Bestätigte dunkle Challenge-Kacheln mit ruhiger Titelschrift, mehr Zeilenabstand und beschrifteten Teilnehmerzahlen umsetzen; Desktop/Mobil und bestehende Katalogfunktionen prüfen.
- [ ] Zeilenendenstrategie für unveränderliche SQL-Migrationen klären: Windows-Checkout von `0015_challenge_pending_status.sql` verwendet CRLF und verletzt den Byte-Prüfsummentest; LF-Inhalt stimmt mit der gespeicherten Prüfsumme überein.

- [ ] ChallengeHub anhand der 10/10-Roadmap in `.hermes/plans/2026-07-27_212856-challengehub-10-von-10-roadmap.md` von Launch-Sicherheit über Produktloop und Barrierefreiheit bis zu belastbarer Nutzer- und Kundenvalidierung entwickeln.
  - [x] Playwright vollständig auf atomar erzeugte, Junction-sicher geprüfte
    Laufpfade für Datenbank, Next-Build, TypeScript-Config und Testergebnisse
    umstellen; eigenen Server erzwingen, Portkollisionen wiederholen und
    SQLite-E2E-Läufe innerhalb eines Laufs deterministisch serialisieren.
  - [x] Next.js und `eslint-config-next` auf eine aktuell gepatchte kompatible Version aktualisieren und Audit, Tests, Build sowie E2E erneut verifizieren.
  - [x] Auth-/UGC-Rate-Limits, zentrale Eingabegrenzen, Security-Header, UGC-Moderation und echte 404-Semantik als weitere Launch-Sicherheits-Slices umsetzen.
  - [x] Unabhängige Security-Review-Befunde zu Reset-KDF-Reihenfolge, globalem Rate-Limit-Pruning, Proxy-Vertrauen, Rohgrößen und Login-Kanonisierung schließen.
  - [x] Gemeinsame barrierefreie Dialogbasis samt Fokusfalle, Escape, Fokus-Rückgabe, Scroll-Lock, Profilmenü-Escape, Skip-Link, `aria-current`, Reduced Motion und automatisiertem WCAG-AA-Scan umsetzen.
  - [x] Manuellen Screenreader-/Zoom-/Reflow-Test mit NVDA sowie Browserzoom 200/400 Prozent durchführen und Befunde dokumentieren.
    - [x] Reflow bei effektiven 200/400-Prozent-Breiten auf Startseite, Katalog und zentraler Detailseite automatisiert sowie visuell prüfen; abgeschnittene Info-Überschrift und überlappende Rankingköpfe beheben.
    - [x] Tastaturdurchlauf mit echtem Browserzoom 200/400 Prozent und portablem NVDA 2026.1.1 auf einem interaktiven Windows-Desktop durchführen; Skip-Link, Mobile-Navigation, Login-Dialog, Seitenstruktur und Ranking-Tabelle erfolgreich prüfen.
  - [x] Startseite als klare deutschsprachige Social-Accountability-Landingpage mit konkretem Freund-/Challenge-Loop überarbeiten.
  - [x] Challenge-Katalog mit Ergebnisanzahl, zwölf initialen Karten und schrittweisem Nachladen langer Listen kuratieren.
  - [x] Roadmap-Task 11 abschließen: kuratierte und veröffentlichte Community-Detailseiten in Hero, Fakten/Regeln, Teilnahme, Top 5, Aktivität und SEO-Inhalt ordnen; ehrliche Leerzustände und erweiterbares Top-20-Ranking ohne Sicherheits-/Gesundheitshinweise umsetzen.
  - [x] Roadmap-Task 12 abschließen: Hauptnavigation semantisch bereinigen, „So funktioniert’s“ und Wissen erreichbar machen, Footer gruppieren, gemeinsame UI-/Status-Primitives sowie belastbare 404- und Error-Zustände einführen.
  - [x] Roadmap-Task 13 abschließen: tägliche Ja/Nein-, kumulative Messwert- und einmalige Ergebnis-Challenges als typisierte Domainmodelle samt Migrationen, Erstellung, Check-ins, Abschlusslogik, passenden Rankings, API und Clientvalidierung umsetzen.
  - [x] Roadmap-Task 14 abschließen: ChallengeMate-Opt-in mit Challenge/Ziel, Zeitraum und Remote/Ort, kompatible Vorschläge, gegenseitige Bestätigung, gemeinsame Ansicht sowie Blockieren/Melden umsetzen.
  - [x] Roadmap-Task 15 abschließen: persistenten In-App-Feed, freiwillige E-Mail-Erinnerungen mit Direkt-Abmeldung, Wochenrückblick, ChallengeMate-Ereignisse, wertungsfreie Reaktivierung und Abschluss-Badge samt idempotenter Zustellqueue umsetzen.
  - [x] Roadmap-Task 16 abschließen: maschinenlesbaren Account-Export, re-authentifizierte Kontolöschung, datensparsame und getrennte Sichtbarkeit für Ranking, Aktivitätsfeed und ChallengeMate sowie eine technisch wahrheitsgemäße Datenschutzseite umsetzen.
  - [x] Roadmap-Task 17 abschließen: E-Mail-Verifikation mit gehashten 30-Minuten-Einmal-Tokens, neutralem und rate-limitiertem Neuversand, Verifikationsroute sowie Status in Auth-Dialog und Profil umsetzen.
  - [ ] Roadmap-Task 18 abschließen: Rechtstexte technisch wahrheitsgemäß vorbereiten und anschließend Betreiberangaben, Rechtsgrundlagen sowie verbindliche Aufbewahrungsfristen fachlich/rechtlich freigeben lassen.
    - [x] Im Registrierungsdialog transparent und ohne irreführende Pflicht-Einwilligung auf die aktuellen Datenschutzhinweise verlinken; mobile Darstellung, Canonical und `noindex` absichern.
    - [x] Tatsächliche Dateninventur mit Zwecken, Empfängern und implementierten Lösch-/Ablauffristen vervollständigen; offene Fristen ausdrücklich als Freigabepunkte markieren.
    - [ ] Betreiberangaben, Rechtsgrundlagen, Aufbewahrungsfristen und Rechtstexte durch Stefan beziehungsweise Rechtsberatung final freigeben lassen.
  - [x] Roadmap-Task 19 abschließen: SEO-Topic-Cluster und Contentqualität mit geprüften Suchintentionen, Quellenvertrauen und passenden Challenge-Einstiegen ausbauen.
    - [x] Bestehende Wissensartikel um sichtbare Autor-/Aktualisierungsangaben, strukturierte Änderungsdaten und passende interne Challenge-CTAs ergänzen.
    - [x] Informationsintention „Wie viele Schritte am Tag?“ mit aktueller systematischer Evidenz, ehrlicher 10.000-Schritte-Einordnung, Sicherheitshinweis und passendem Challenge-Einstieg abdecken.
    - [x] Informationsintention „Ist Social Media Detox sinnvoll?“ mit widersprüchlicher aktueller Evidenz, umsetzbaren Pausenregeln, Hilfeschwelle und passendem Challenge-Einstieg abdecken.
    - [x] Informationsintention „Wie lange dauert es, eine Gewohnheit aufzubauen?“ mit aktueller systematischer Evidenz, Einordnung der 21-/66-Tage-Zahlen und passendem 90-Tage-Challenge-Einstieg abdecken.
    - [x] Die sechs Wissensartikel mit je zwei fachlich passenden, serverseitig crawlbaren Empfehlungen zu einem geschlossenen internen Themencluster verbinden und Challenge-Ankertexte konkretisieren.
    - [x] Den Bestandsartikel zur Habit Loop fachlich überarbeiten: populäres Drei-Schritte-Modell von belastbarer Evidenz trennen, aktuelle Fachquellen ergänzen und Wirkversprechen begrenzen.
    - [x] Den Bestandsartikel zu sieben Habit Rules als ausdrücklich begrenzte Planungswerkzeuge mit aktuellen Review-/Primärquellen, realistischen Rückkehrregeln und ohne pauschale Identitäts-, Streak- oder Belohnungsversprechen überarbeiten.
    - [x] Den Bestandsartikel zu Tiny Habits als klar begrenzte Designmethode einordnen, direkte Forschung von Methodenbehauptungen trennen und pauschale Belohnungs- sowie Erfolgsaussagen entfernen.
    - [x] Eine dokumentierte Cluster-Gap-Analyse gegen aktuelle deutschsprachige Suchergebnisse und geprüfte Fachquellen erstellen; „Streak verloren – wie weitermachen?“ als klar abgegrenzte nächste Informationsintention priorisieren.
    - [x] Den priorisierten Wissensartikel „Streak verloren – wie weitermachen?“ mit sichtbaren Evidenzgrenzen, internem Wissenscluster und passendem Challenge-Einstieg umsetzen.
  - [ ] Roadmap-Task 20 abschließen: vollständige PostgreSQL-Parität für alle Repository-Grenzen herstellen und erst nach echter Integrations-, Migrations-, Backup- und Rollback-Probe eine Runtime-Umschaltung erwägen.
    - [x] Nutzergebundene Teilnahme-, Detail- und Check-in-Lesezugriffe als asynchronen, parametrisierten PostgreSQL-Adapter mit gemeinsamem Query-Client-Vertrag vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Öffentliche Teilnahme-Zähler, Ranking-Kandidaten und Aktivitäts-Lesewege asynchronisieren und mit einem parametrisierten, Privacy-Opt-ins wahrenden PostgreSQL-Adapter vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Check-in-Schreibweg asynchronisieren und einen transaktionalen PostgreSQL-Adapter mit nutzergebundener Sperre, Idempotenz, Messwertvalidierung und typgerechtem Teilnahmeabschluss vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Teilnahme-Start und -Austritt asynchronisieren und einen transaktionalen PostgreSQL-Adapter mit Freigabe-, Duplikat-, Nutzer- und Eigentumsregeln vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Öffentliche Challenge-Erstellung asynchronisieren und einen parametrisierten PostgreSQL-Adapter mit Moderations-, Slug-, Ersteller- und Konfliktregeln sowie passender Status-Migration vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Account- und Session-Grenze mit parametrisiertem PostgreSQL-Adapter für NFKC-/Name-Key-Eindeutigkeit, Login, Ablauf und Tokenkonflikte samt Folgemigration vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Passwort-Reset-Grenze asynchronisieren und einen transaktionalen PostgreSQL-Adapter für gehashte Einmal-Tokens, zustellungsabhängige Ablösung, Ablauf, konkurrierenden Verbrauch und Sessionwiderruf vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] E-Mail-Verifikationsgrenze asynchronisieren und einen transaktionalen PostgreSQL-Adapter für unverifizierte Konten, gehashte Einmal-Tokens, zustellungsabhängige Ablösung, Ablauf und atomare Verifikation vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Challenge-Einladungsgrenze asynchronisieren und einen transaktionalen PostgreSQL-Adapter für gehashte, ablaufende Tokens, Eigentumsprüfung, aktive Teilnahme und atomare Annahme vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] ChallengeMate-Grenze asynchronisieren und einen transaktionalen PostgreSQL-Adapter für Opt-in, Privacy, kompatible Vorschläge, gegenseitige Bestätigung, Blockieren und Melden vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Retention-Grenze asynchronisieren und einen transaktionalen PostgreSQL-Adapter für Präferenzen, idempotente In-App-Meldungen, nutzergebundene Lesestatus-/Abmeldewege sowie die E-Mail-Zustellqueue vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Account-Daten-/Löschgrenze asynchronisieren und einen transaktionalen PostgreSQL-Adapter für datensparsame Privacy-Defaults, vollständigen Export ohne Secrets und atomare Kontolöschung vorbereiten; SQLite als aktive Runtime unverändert lassen.
    - [x] Bootstrap-Grenze für Systemnutzer und kuratierte Challenges asynchronisieren und mit einem transaktionalen, idempotenten PostgreSQL-Adapter vorbereiten; SQLite als aktive Runtime unverändert lassen.
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
- [x] Geschützte Profilseite mit änderbarem, case-insensitiv eindeutigem
  Benutzernamen, Profilmenü-Link und vollständigem E2E-Flow umsetzen.
- [x] Challenge-Ranking auf Top 20 erweitern und eingeloggten Teilnehmern
  außerhalb der Top 20 die eigene Position mit direkten Nachbarn anzeigen.
- [ ] Resend-Zugang und Absenderadressen für den produktiven Versand der
  Passwort-Reset- und E-Mail-Verifikationsmails konfigurieren und mit echten
  Zustellungen prüfen.
- [ ] `RATE_LIMIT_SECRET` und `TRUST_PROXY=true` im Zielbetrieb sicher konfigurieren,
  damit HMAC-Identifier, persistente Limits und die Client-IP-Auswertung Neustarts
  sowie den Caddy-Reverse-Proxy korrekt überstehen.

## Later

- [x] Überschriftenhierarchie in `text-v2.txt` explizit markieren und prüfen: ein H2, acht H3 einschließlich Quellen und weiterführender Challenges.

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

## Markdown-Seitentexte und Startseite (2026-10-20)

- [x] Sieben öffentliche Seiten über content/pages bearbeitbar machen, validieren und dokumentieren.
- [x] Neue Startseitentexte und drei Challenge-Varianten integrieren; Vorschaukachel entfernen. Lint, Build und zwölf Browserprüfungen erfolgreich.
- [ ] Autorisierten Release nach Produktionsimage-Prüfung mit Backup aktivieren und live prüfen.
