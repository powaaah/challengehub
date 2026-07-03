# ChallengeHub.de Log

## 2026-06-01 - Projektarbeitsweise vorbereitet

- `AGENTS.md` um feste Todo- und Log-Regeln erweitert.
- `TODOS.md` als zentrale Aufgabenliste angelegt.
- `LOG.md` als fortlaufendes Arbeitsprotokoll angelegt.
- Hinweis fuer naechsten Agenten: Vor Codeaenderungen erst `AGENTS.md`,
  `TODOS.md` und dieses Log lesen.

## 2026-06-01 - Erste Next.js-Slice aufgebaut

- Ziel: ChallengeHub.de als Next.js-App mit erstem nutzbaren UI-Slice nachbauen.
- Aenderungen: Next.js 16 App Router mit TypeScript/ESLint eingerichtet, Startseite,
  Navigation, Hero, Social Links, statische Challenge-Uebersicht, Sortierung,
  Filter-Dialog sowie Login/Register/Forgot-Dialoge umgesetzt.
- Verifikation: `npm run lint`, `npm run build`, Desktop-/Mobile-Screenshots mit
  Playwright und interaktiver Smoke-Test fuer Mobile-Menue, Login-Dialog und Filter.
- Offene Risiken: npm meldet 2 moderate Vulnerabilities im Dependency-Tree; Footer-
  Seiten, Auth, Datenpersistenz und Deployment sind noch nicht umgesetzt.
- Naechster Schritt: Footer-Seiten und fachlichen Daten-/Auth-Scope festlegen.

## 2026-06-01 - Challenge-Kacheln visuell angeglichen

- Ziel: Schriftgroessen und Farben der Challenge-Kacheln enger an die bestehende
  PHP-Seite angleichen.
- Aenderungen: Original-CSS referenziert und Kachel-Farben, feste Hoehe,
  Titelgroesse, Font-Gewichte, Schatten, Grid-Spalten und Hintergrundfarben
  entsprechend angepasst.
- Verifikation: `npm run lint`, `npm run build`, Playwright-Screenshots fuer
  Desktop/Mobile und gezielter Screenshot des Challenge-Grids.
- Offene Risiken: Hero/Navigation sind weiterhin bewusst modernisiert und noch
  nicht pixelgenau rekonstruiert.
- Naechster Schritt: Entscheiden, ob der gesamte Look pixelnaeher zur Altseite
  oder bewusst modernisiert werden soll.

## 2026-06-03 - Challenge-Suche und Neueste-Sortierung

- Ziel: Challenge-Uebersicht per Textsuche durchsuchbar machen und Sortierung
  nach Erstellungsdatum anbieten.
- Aenderungen: Statische Challenge-Daten um `createdAt` erweitert, Suchfeld in
  der Toolbar ergaenzt, kombinierte Suche/Filter/Sortierlogik umgesetzt,
  Sortieroption `Neueste` sowie Empty-State fuer keine Treffer hinzugefuegt.
- Verifikation: `npm run lint`, `npm run build`, Playwright-Smoke-Test fuer
  Suche nach `Liegestuetze`, Umlaut-Suche via Unicode-Escape, Sortierung
  `Neueste`, Empty-State und visueller Toolbar-Check per Screenshot.
- Offene Risiken: Erstellungsdaten sind vorlaeufige statische Referenzwerte,
  bis echte Datenpersistenz geklaert ist.
- Naechster Schritt: Datenmodell fuer echte Challenge-Erstellung und Speicherung
  fachlich festlegen.

## 2026-06-03 - Challenge-Detailseiten umgesetzt

- Ziel: Challenge-Kacheln aus der Uebersicht auf echte Detailseiten fuehren.
- Aenderungen: Challenge-Daten um `slug`, `duration`, `goal`, `description` und
  `rules` erweitert, Kacheln als Links auf `/challenges/[slug]` umgesetzt,
  statisch generierte Detailseiten mit Header, Hero, Kennzahlen, Ziel und Regeln
  angelegt.
- Verifikation: `npm run lint`, `npm run build`, Playwright-Smoke-Test fuer
  Kachelklick, Detailinhalt, Zurueck-Link und unbekannten Slug mit 404;
  Desktop- und Mobile-Screenshots der Detailseite geprueft.
- Offene Risiken: Detailtexte und Erstellungsdaten sind vorlaeufige statische
  Inhalte; `Challenge starten` ist noch nicht an Auth/Teilnahme angebunden.
- Naechster Schritt: Teilnahme-Flow oder Footer-Seiten als naechsten kleinen
  Slice festlegen.

## 2026-06-03 - Challenge-Detailseiten fuer SEO optimiert

- Ziel: Challenge-Detailseiten fuer organische Suche und Social Sharing
  interessanter machen.
- Aenderungen: Globale `metadataBase` und Social-Metadaten ergaenzt,
  Challenge-Daten um `seoDescription`, `tips` und `faq` erweitert,
  detailseitige Metadata mit Canonical, OpenGraph und Twitter Cards aufgebaut,
  JSON-LD fuer `Article`, `HowTo` und `FAQPage` eingebunden sowie sichtbare
  Tipps- und FAQ-Sektionen hinzugefuegt.
- Verifikation: `npm run lint`, `npm run build`, HTTP-Check auf Title,
  Description, Canonical, JSON-LD, `FAQPage`, `HowTo` und sichtbare SEO-Inhalte;
  Playwright-Smoke-Test fuer Tipps/FAQ plus Mobile-Screenshot.
- Offene Risiken: SEO-Texte sind noch vorlaeufig und ohne Keyword-Recherche;
  echte Social-Preview-Bilder fehlen noch.
- Naechster Schritt: Finale Keyword-/Content-Ausrichtung pro Challenge oder
  Social-Preview-Bildstrategie festlegen.

## 2026-06-03 - Effekte, Quellen, Plaene und Meta-Challenge

- Ziel: Challenge-Seiten inhaltlich wertvoller machen durch positive Effekte,
  wissenschaftliche Quellen, Trainingsplaene und eine kombinierte
  "Change your life"-Challenge.
- Aenderungen: Challenge-Daten um `benefits`, Quellen, optionale `plan`- und
  `stack`-Felder erweitert, wissenschaftliche Evidenzsektion mit Quellenlinks,
  Plan- und Stack-Ansichten auf Detailseiten gerendert und neue Challenge
  `Change your life in 90 Tagen` hinzugefuegt.
- Quellenbasis: Schritte/Mortalitaet, Muskeltraining/Mortalitaet, Schlafdauer,
  Schlaf und Lernen, Implementation Intentions, lange Arbeitszeiten sowie
  Ernaehrungs-/Zeitfenster-Studien.
- Verifikation: `npm run lint`, `npm run build`, HTTP-Check auf Meta-Challenge
  und JSON-LD-ItemList, Playwright-Smoke-Tests fuer sichtbare Quellen,
  Plan/Stack, Suche und `Neueste`-Sortierung.
- Offene Risiken: Inhalte sind keine medizinische Beratung; Sicherheits- und
  Gesundheitsdisclaimer sollten vor Livegang final abgestimmt werden.
- Naechster Schritt: Disclaimer/Teilnahmehinweise und ggf. echte Preview-Bilder
  fuer die neue Meta-Challenge ergaenzen.

## 2026-06-03 - Wissensdatenbank fuer Habit Rules

- Ziel: ChallengeHub um eine crawlbare Wissens-/Blogsektion zu Gewohnheiten,
  Habit Rules und bekannten Habit-Buechern erweitern.
- Aenderungen: `data/habit-articles.ts` mit drei Startartikeln angelegt,
  `/wissen` als Hub-Seite und `/wissen/[slug]` als statische Artikelroute
  erstellt, Artikel mit Quellenbox, Takeaways, JSON-LD und Metadaten umgesetzt,
  Hauptnavigation und Footer um `Wissen` ergaenzt.
- Quellenbasis: James Clear/Atomic Habits, BJ Fogg/Tiny Habits und Behavior
  Model, Charles Duhigg/The Power of Habit, Wendy Wood/Good Habits Bad Habits
  sowie Studien/Reviews zu Implementation Intentions und Selbstregulation.
- Verifikation: `npm run lint`, `npm run build`, HTTP-Checks fuer Hub/Artikel,
  JSON-LD und Quellenmarker sowie Playwright-Klickflow Startseite -> Wissen ->
  Artikel mit Screenshots.
- Offene Risiken: Artikel sind solide Starttexte, aber noch keine vollstaendige
  Keyword-Recherche oder redaktionell finale Content-Serie.
- Naechster Schritt: Weitere Artikelcluster zu Motivation, Streaks, Rueckfaellen,
  Identitaet, Umgebung und Tracking ausarbeiten.

## 2026-06-04 - Footer-Seiten und Sicherheitshinweise

- Ziel: Rechtliche Footer-Routen und sichtbare Sicherheits-/Gesundheitshinweise
  als naechsten Livegang-Vorbereitungsschritt anlegen.
- Aenderungen: `/impressum`, `/datenschutz`, `/sicherheit` und `/karriere`
  erstellt, Footer-Links auf echte Routen umgestellt, Challenge-Detailseiten um
  Sicherheitsbox mit Link zu `/sicherheit` ergaenzt.
- Quellenbasis: DDG § 5 fuer Anbieterkennzeichnung und DSGVO Art. 13 fuer
  Informationspflichten als offizielle Orientierung geprueft.
- Verifikation: `npm run lint`, `npm run build`, Playwright-Smoke-Test fuer
  Footer-Link `Sicherheit`, Impressums-Warnhinweis und Challenge-Sicherheitslink;
  HTTP-Check fuer alle vier neuen Routen.
- Offene Risiken: Impressum und Datenschutz enthalten bewusst Platzhalter und
  sind nicht final livegangfaehig; Betreiberangaben, Datenschutzdetails und
  rechtliche Pruefung fehlen noch.
- Naechster Schritt: Stefan traegt finale Betreiber-/Kontakt-/Datenschutzdaten
  ein oder gibt sie fuer die finale Ausformulierung frei.

## 2026-06-06 - Lokaler Teilnahme-MVP

- Ziel: Aus `Challenge starten` einen testbaren Produktflow machen, bevor Auth
  und Datenbank eingefuehrt werden.
- Aenderungen: `ChallengeStart`-Client-Komponente mit Start-Modal,
  Sicherheitsbestaetigung und `localStorage`-Persistenz erstellt,
  `/meine-challenges` als lokales Dashboard mit aktiven Challenges, Check-ins,
  Streak, Detail-Link und Entfernen-Aktion umgesetzt, Navigation um
  `Meine Challenges` ergaenzt.
- Verifikation: `npm run lint`, `npm run build`, Playwright-Smoke-Test fuer
  Detailseite -> Challenge starten -> Sicherheitscheckbox -> Dashboard ->
  heutigen Check-in; Desktop- und Mobile-Screenshots geprueft.
- Offene Risiken: Daten liegen nur lokal im Browser und sind nicht mit Login,
  Geraeten oder Server synchronisiert; Streak-Logik ist bewusst MVP-einfach.
- Naechster Schritt: Datenmodell und echte Auth-/DB-Persistenz fuer Teilnahme,
  Check-ins und Streaks fachlich festlegen.

## 2026-06-07 - Hero-Suche auf der Startseite

- Ziel: Unter dem Hero-Subtitle eine prominente Challenge-Suche mit
  `Find your challenge`-Button ergaenzen.
- Aenderungen: Hero-Suchformular in die Startseite eingefuegt, mit der
  bestehenden Challenge-Suche synchronisiert und Submit-Scroll zur
  Challenge-Liste verdrahtet; Desktop- und Mobile-Styling ergaenzt.
- Verifikation: `npm run lint`, `npm run build`, Playwright-Smoke-Test fuer
  Suche, Toolbar-Synchronisierung, Filterergebnis und Scroll-Verhalten; Desktop-
  und Mobile-Screenshots geprueft.
- Offene Risiken: Desktop-Fullpage-Screenshot nach Scroll zeigt die sticky
  Navigation ueber dem Seiteninhalt; der initiale Viewport ist visuell sauber.
- Naechster Schritt: Startseiten-Hero als Ganzes gegen die Live-Vorlage und die
  gewuenschte Markenwirkung feinabstimmen.

## 2026-06-07 - GitHub-Merge vorbereitet

- Ziel: Lokalen ChallengeHub-Stand auf GitHub `powaaah/challengehub` mergen.
- Aenderungen: `.agents/` explizit ignoriert, damit lokale Agenten-Skills nicht
  ins Repo gelangen.
- Verifikation: `npm run lint`, `npm run build`, Secret-Suche mit `rg`.
- Ergebnis: Checks erfolgreich; nur harmlose Secret-Suchtreffer wie
  Passwort-Input-Felder und Paketnamen.
- Naechster Schritt: Commit auf `main` erstellen und nach `origin/main` pushen.

## 2026-06-07 - Testdeployment auf theovina.de

- Ziel: ChallengeHub testweise ueber eine bereits auf den VPS zeigende Domain
  erreichbar machen.
- Aenderungen auf dem VPS: Repo nach `/home/stefan/projects/challengehub`
  geklont, `npm ci` und `npm run build` ausgefuehrt, Stack-Service
  `challengehub` mit `node:24-bookworm-slim` angelegt und Caddy-Route
  `theovina.de, www.theovina.de -> challengehub:3000` ergaenzt.
- Verifikation: `docker compose config`, laufender Container
  `stack-challengehub-1`, interner Caddy-Container-HTTP-Check und externe
  HTTPS-Checks fuer `https://theovina.de` und `https://www.theovina.de/wissen`
  mit Inhaltsmarkern.
- Offene Risiken: Testdomain ist nicht die finale Marke; Metadaten wie `og:url`
  zeigen weiterhin auf `https://challengehub.de`.
- Naechster Schritt: Nach visueller Abnahme final entscheiden, ob DNS fuer
  `challengehub.de` auf den VPS umgestellt und die Caddy-Route auf die echte
  Domain umgezogen wird.

## 2026-06-20 - Lokale Challenge-Erstellung und Fortschritt

- Ziel: MVP-Kern erweitern, sodass Nutzer Challenges finden, oeffentlich
  erstellen, starten, abhaken und Fortschritt sehen koennen.
- Aenderungen: `/challenges/neu` mit Formular und Live-Vorschau erstellt,
  lokale User-Challenges in `localStorage` gespeichert, Startseite mit
  kuratierten und erstellten Challenges zusammengefuehrt, dynamischen
  Detailseiten-Fallback fuer lokale Challenges ergaenzt, Start-Flow um
  Ziel-Tage erweitert und `/meine-challenges` um Fortschrittsbalken sowie
  Erstellen-Links verbessert.
- Verifikation: `npm run lint`, `npm run build`, Playwright-Smoke-Test fuer
  Erstellen -> Detailseite -> Starten -> Dashboard -> Check-in -> Katalog sowie
  mobile/Desktop-Layoutcheck fuer `/challenges/neu`.
- Offene Risiken: User-Challenges und Check-ins sind weiterhin nur lokal im
  Browser gespeichert; keine Account-, Moderations- oder Serverpersistenz.
- Naechster Schritt: Auth-/Datenbankmodell fuer User, Challenges,
  Teilnahmen und Check-ins festlegen und die lokale Persistenz ersetzen.

## 2026-06-20 - Account und serverseitige Challenge-Erstellung

- Ziel: Naechsten MVP-Schritt umsetzen: Account-Basis und serverseitig
  gespeicherte oeffentliche Challenges als Fundament fuer echte Persistenz.
- Aenderungen: Native SQLite-Persistenz ueber Node 24 `node:sqlite` angelegt,
  Tabellen fuer User, Sessions, Challenges, Teilnahmen und Check-ins erstellt,
  E-Mail/Passwort-Registrierung, Login und Logout mit HTTP-only Session-Cookie
  umgesetzt, `/challenges/neu` auf serverseitige Speicherung fuer eingeloggte
  Nutzer umgestellt, Startseite und Challenge-Detailseiten um gespeicherte
  oeffentliche Challenges erweitert.
- Verifikation: `npm run lint`, `npm run build`, Playwright-Smoke-Test fuer
  Registrierung -> Challenge-Erstellung -> Detailseite -> Katalog sowie
  mobile/Desktop-Layoutchecks fuer `/auth` und `/challenges/neu`.
- Offene Risiken: `node:sqlite` ist in Node 24 noch als experimental markiert;
  Teilnahme und Check-ins nutzen weiterhin den lokalen Browser-MVP und muessen
  im naechsten Slice auf die SQLite-Tabellen umgezogen werden.
- Naechster Schritt: `Challenge starten`, aktive Challenges und taegliche
  Check-ins fuer eingeloggte Nutzer serverseitig speichern.

## 2026-06-23 - Account-Slice committen und pushen

- Ziel: Lokalen Account-/SQLite-Stand pruefen, dokumentieren und nach GitHub
  bringen.
- Aenderungen: README an den aktuellen MVP-Stand angepasst; bestehende
  Account-/SQLite-Slice fuer Commit vorbereitet.
- Verifikation: `npm run lint`, `npm run build`; lokaler Produktions-Smoke-Test
  fuer `/`, `/auth` und `/challenges/neu` mit Inhaltsmarkern.
- Offene Risiken: `node:sqlite` meldet weiterhin die erwartete Experimental-
  Warnung; Teilnahmen und Check-ins sind noch nicht serverseitig angebunden.
- Naechster Schritt: Persistente Teilnahmen und Check-ins fuer eingeloggte
  Nutzer umsetzen.

## 2026-06-23 - Startseiten-Layout bereinigt

- Ziel: Merkwuerdige Startseiten-Darstellung nach Account-Slice korrigieren.
- Aenderungen: Header auf volle Breite gesetzt, Ranking-Link an die
  Challenge-Liste statt an den Quote-Block gekoppelt, Leitsatz als kompakten
  Streifen gestaltet, Toolbar und Challenge-Kacheln ruhiger ausgerichtet,
  englische Rest-CTAs entfernt.
- Verifikation: `npm run lint`, `npm run build`; Playwright-Screenshots fuer
  Desktop und Mobile an Hero und Challenge-Liste.
- Offene Risiken: Visuelle Feinabstimmung kann nach Stefans Review weiter
  iteriert werden; `node:sqlite` meldet weiterhin die bekannte Experimental-
  Warnung im Build.
- Naechster Schritt: Layout gegen die gewuenschte Markenwirkung feinabstimmen
  oder mit persistenter Teilnahme/Check-ins fortfahren.

## 2026-06-23 - Challenge-Katalog ausgelagert

- Ziel: Startseite auf Hero und Social-Einstieg reduzieren und Challenges als
  eigene Unterseite fuehren.
- Aenderungen: Neue Route `/challenges` mit Suche, Filter, Sortierung und
  Challenge-Kacheln erstellt; Startseite vom Katalog getrennt, Hero-H1 auf
  `5rem` gesetzt, untere Hero-Buttons entfernt, Social-Icons transparent mit
  grauem Hover gestaltet.
- Verifikation: `npm run lint`, `npm run build`; Playwright-Screenshots fuer
  Startseite und `/challenges` jeweils Desktop und Mobile.
- Offene Risiken: Live/Testdomain braucht ein separates Deployment-Update.
- Naechster Schritt: Visuelle Abnahme der neuen Startseite und Katalogseite.

## 2026-06-23 - Testdomain aktualisiert

- Ziel: Aktuellen GitHub-Stand auf der bestehenden Testdomain sichtbar machen.
- Aenderungen: VPS-Checkout per Fast-Forward von `445ab57` auf `28e2ef6`
  aktualisiert, `npm ci` und `npm run build` ausgefuehrt, bestehenden
  `challengehub`-Service neu gestartet.
- Verifikation: Container laeuft; `https://theovina.de` liefert den neuen
  Startseiten-Marker `Find your challenge` ohne Katalog-Marker;
  `https://theovina.de/challenges?sort=rating` liefert `Challenge-Katalog`,
  `Neue Challenge` und `Bewertung`; `www`-Variante mit Suche nach `burpees`
  liefert `100 Burpees pro Tag`.
- Offene Risiken: `npm ci` meldet zwei moderate Audit-Funde; Testdomain ist
  weiterhin nicht die finale Domain.
- Naechster Schritt: Visuelle Abnahme im Browser; spaeter Deployment-Strategie
  fuer die finale Domain abstimmen.

## 2026-06-23 - Produktentscheidungen Header und Profilmenue

- Ziel: Besprochene Produktentscheidungen zu Header, Profilmenue,
  Challenge-Erstellung und Challenge Mate dauerhaft festhalten.
- Aenderungen: `docs/product-decisions.md` angelegt mit Entscheidungen:
  `Wissen` raus aus Header, `Meine Challenges` nur eingeloggt, Profilmenue mit
  Konto/Meine Challenges/Challenge Mate finden/Logout, keine prominente
  Challenge-Erstellung ohne vorherigen Abgleich, Challenge-Mate-Idee mit
  Privacy-Anforderungen.
- Verifikation: Dokumentationsaenderung, keine Codechecks erforderlich.
- Offene Risiken: Umsetzung steht noch aus.
- Naechster Schritt: Header-Navigation und eingeloggtes Profilmenue als kleine
  UI/Auth-Slice umsetzen.

## 2026-06-23 - Header-Profilmenue umgesetzt

- Ziel: Die letzten Produktentscheidungen fuer Header und eingeloggte
  Nutzerfuehrung in Code umsetzen.
- Aenderungen: Gemeinsamer Header entfernt `Wissen`, zeigt ausgeloggt nur
  `Challenges`, `Ranking` und `Login`, zeigt eingeloggt ein Profilmenue mit
  `Konto`, `Meine Challenges`, `Challenge Mate finden` und `Logout`;
  `/meine-challenges` ist fuer ausgeloggte Nutzer auf Login umgeleitet;
  `/challenge-mate` als vorbereitete eingeloggte Route angelegt; prominente
  `Neue Challenge`-CTA aus dem Katalog entfernt und nur noch im Empty State als
  Vorschlag angezeigt.
- Verifikation: `npm run lint`, `npm run build`; Browser-Smoke fuer
  ausgeloggten Header, eingeloggtes Profilmenue, `/challenge-mate`,
  Login-Redirect von `/meine-challenges` und Empty-State-CTA im Katalog.
- Offene Risiken: Detail-, Legal- und Wissensseiten haben noch teils eigene
  Mini-Navigationen und sollten spaeter auf einen gemeinsamen Header umgestellt
  werden.
- Naechster Schritt: Challenge-Erstellung mit Abgleich gegen bestehende
  Challenges fachlich ausarbeiten.

## 2026-06-23 - Testdomain mit Profilmenue aktualisiert

- Ziel: Den aktuellen Header-/Profilmenue-Stand auf der Testdomain sichtbar
  machen.
- Aenderungen: VPS-Checkout von `67eb416` auf `5857f6a` per Fast-Forward
  aktualisiert, Dependencies installiert, frischen Next.js-Build erzeugt und
  bestehenden `challengehub`-Service neu gestartet.
- Verifikation: `https://theovina.de` liefert HTTP 200 mit `Login`,
  `Challenges` und `Ranking` ohne oeffentlichen `Challenge Mate finden`-Marker;
  `https://theovina.de/challenges?suche=zzzzzzzzzzzz` zeigt
  `Keine passende Challenge gefunden? Neue Challenge vorschlagen`;
  `https://theovina.de/challenge-mate` leitet ausgeloggt per 307 auf
  `/auth?next=/challenge-mate`; Auth-Seite enthaelt Account-/Formularmarker.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde;
  Container-Logs zeigten alte Server-Action-Requests aus vorherigen Builds,
  der neue Prozess startet aber sauber.
- Naechster Schritt: Visuelle Abnahme auf der Testdomain.

## 2026-06-23 - Typografie-Varianten als HTML-Prototyp

- Ziel: Drei Schriftbild-Richtungen fuer die Challenge-Seite schnell
  vergleichbar machen.
- Aenderungen: `typography-variants.html` als statische Vergleichsseite mit
  Dropdown fuer Modern, Editorial und Sportlich angelegt.
- Verifikation: Playwright-Datei-Smoke; Dropdown schaltet alle Varianten,
  Hero und Challenge-Karten sind sichtbar.
- Offene Risiken: Nutzt Google Fonts im Browser; finale Einbindung in Next.js
  ist noch nicht umgesetzt.
- Naechster Schritt: Bevorzugte Richtung auswaehlen und als kleine
  Typografie-Slice in die App uebertragen.

## 2026-06-23 - Segoe-UI-Variante ergaenzt

- Ziel: Eine systemnahe Segoe-UI-Richtung im Typografie-Prototyp vergleichen.
- Aenderungen: `typography-variants.html` um Variante D mit Segoe UI fuer
  Display-, Body- und UI-Schrift erweitert.
- Verifikation: Playwright-Datei-Smoke fuer Modern, Editorial, Sportlich und
  Segoe UI erfolgreich.
- Offene Risiken: Statischer Prototyp; keine Aenderung an der Next.js-App.
- Naechster Schritt: Favorisierte Richtung fuer die App auswaehlen.

## 2026-06-29 - Segoe-UI-Typografie in App uebertragen

- Ziel: Die ausgewaehlte Segoe-UI-Richtung in die Next.js-App uebernehmen und
  bewusst filigraner halten.
- Aenderungen: Globale Font-Variablen fuer Segoe UI Display/Text/UI angelegt,
  alte Georgia-/Trebuchet-Sonderfaelle in CSS-Modulen ersetzt und sehr schwere
  800/900er-Schriftgewichte auf leichtere 650/600er-Gewichte reduziert.
- Verifikation: `npm run lint`, `npm run build`, `git diff --check`;
  Playwright-Screenshots fuer Startseite und Challenge-Katalog in Desktop und
  Mobile visuell geprueft.
- Offene Risiken: Visueller Geschmack muss noch final von Stefan abgenommen
  werden; Build meldet weiterhin Node-Warnungen zu experimentellem SQLite.
- Naechster Schritt: Typografie im Browser abnehmen und danach die
  Challenge-Erstellung mit Abgleich gegen bestehende Challenges ausarbeiten.

## 2026-06-29 - Segoe-UI-Typografie auf Testdomain deployed

- Ziel: Den filigraneren Segoe-UI-Stand auf der bestehenden Testdomain sichtbar
  machen.
- Aenderungen: Commit `882946b` nach GitHub gepusht, VPS-Checkout
  `/home/stefan/projects/challengehub` per Fast-Forward aktualisiert,
  Dependencies installiert, frischen Next.js-Build erzeugt und bestehenden
  `challengehub`-Service neu gestartet.
- Verifikation: `https://theovina.de`, `/challenges` und
  `www.theovina.de/challenges?suche=burpees` liefern HTTP 200;
  `/challenge-mate` leitet ausgeloggt per 307 auf Auth um; Live-Screenshots
  fuer Desktop/Mobile geprueft; berechnete H1-Styles nutzen
  `Segoe UI Variable Display` mit `font-weight: 600`.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde; alte
  Server-Action-Requests erschienen vor dem Neustart noch in Container-Logs.
- Naechster Schritt: Visuelle Abnahme auf `https://theovina.de`.

## 2026-06-29 - Katalog-Umlaut korrigiert

- Ziel: Sichtbare ASCII-Transliteration im Challenge-Katalog entfernen.
- Aenderungen: Katalog-Headline von `Finde deine naechste Challenge` auf
  `Finde deine nächste Challenge` korrigiert und `oeffentlichen` im selben
  Textblock auf `öffentlichen` umgestellt.
- Verifikation: `npm run lint`, `npm run build`; alter sichtbarer String nicht
  mehr im App-/Component-Code gefunden.
- Offene Risiken: Weitere Daten-/Wissensartikel enthalten noch bewusst
  unveränderte ASCII-Transliterationen aus frueheren Inhalten.
- Naechster Schritt: Fix auf die Testdomain deployen.

## 2026-06-29 - Liegestuetze/Stueck-Umlaute korrigiert

- Ziel: Sichtbare Challenge-Texte mit `Liegestuetze` und `Stueck` korrigieren.
- Aenderungen: Titel, Goals, SEO-Beschreibungen und FAQ-Texte in
  `data/challenges.ts` auf `Liegestütze`, `Stück`, `für`, `über` und
  `Ausführung` umgestellt; Slugs bewusst unverändert gelassen.
- Verifikation: `npm run lint`, `npm run build`; alte `Liegestuetze`/`Stueck`
  Treffer bleiben nur noch in stabilen Slugs.
- Offene Risiken: Weitere ASCII-Transliterationen in älteren Daten- und
  Wissensinhalten sind noch nicht flächig bereinigt.
- Naechster Schritt: Fix auf die Testdomain deployen.

## 2026-07-03 - Katalog-Toolbar und Beginner-Text angepasst

- Ziel: Die im Screenshot markierten Katalog-Toolbar-Styles uebernehmen,
  Beginner-Karten lesbarer machen und einen direkten CTA zur Challenge-Erstellung
  ergaenzen.
- Aenderungen: `--beginner-text` auf weiss gestellt, Toolbar-Rahmen,
  Hintergrund und Radius entfernt, Toolbar-Grid um eine CTA-Spalte erweitert und
  `Neue Challenge hinzufuegen` als Button-Link zu `/challenges/neu` neben dem
  Sortier-Dropdown eingefuegt.
- Verifikation: `npm run lint`, `npm run build`; lokale Playwright-Screenshots
  fuer Desktop/Mobile; DOM-Check bestaetigt Button-Link, blauen CTA,
  weissen Beginner-Text sowie transparente Toolbar ohne Border.
- Offene Risiken: Keine bekannt; visuelle Feinabnahme auf Testdomain steht nach
  Deployment noch aus.
- Naechster Schritt: Aenderung committen und auf die Testdomain deployen, falls
  Stefan das live sehen moechte.

## 2026-07-03 - Katalog-Toolbar-CTA auf Testdomain deployed

- Ziel: Den angepassten Katalog mit CTA und weissem Beginner-Text auf
  `theovina.de` sichtbar machen.
- Aenderungen: Commit `d2b7c18` nach GitHub gepusht, VPS-Checkout per
  Fast-Forward aktualisiert, Dependencies installiert, frischen Next.js-Build
  erzeugt und bestehenden `challengehub`-Service neu gestartet.
- Verifikation: `https://theovina.de/challenges` liefert HTTP 200; Live-DOM-Check
  bestaetigt `Neue Challenge hinzufügen` mit Link auf `/challenges/neu`, blauen
  CTA, weissen Beginner-Text und transparente Toolbar ohne Border.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde; alte
  Server-Action-Requests erschienen vor dem Neustart noch in Container-Logs.
- Naechster Schritt: Visuelle Abnahme auf der Testdomain.

## 2026-07-03 - Katalog-Toolbar-Spacing deployed

- Ziel: Stefans nachgezogene Toolbar-CSS-Anpassung live stellen.
- Aenderungen: Toolbar-Padding auf `0 0 1.9rem 0` geaendert und
  `box-shadow` entfernt.
- Verifikation: `npm run lint`, `npm run build`; VPS-Build erfolgreich;
  `https://theovina.de/challenges` liefert HTTP 200; Live-DOM-Check bestaetigt
  Toolbar-Padding `0px 0px 30.4px`, `box-shadow: none`, transparente Toolbar
  und vorhandenen CTA `Neue Challenge hinzufügen`.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde.
- Naechster Schritt: Visuelle Abnahme auf der Testdomain.

## 2026-07-03 - Katalog-Hero-Breite deployed

- Ziel: Nachtraegliche lokale CSS-Aenderung an der Katalog-Hero-Headline live
  stellen.
- Aenderungen: `.catalogHero h1` von `max-width: 12ch` auf `32ch` erweitert.
- Verifikation: `npm run lint`, `npm run build`; VPS-Build erfolgreich;
  `https://theovina.de/challenges` liefert HTTP 200; Live-DOM-Check bestaetigt
  H1-Max-Width `1137px`, Toolbar-Padding `0px 0px 30.4px` und
  `box-shadow: none`.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde.
- Naechster Schritt: Visuelle Abnahme auf der Testdomain.

## 2026-07-03 - 10.000-Schritte-Detailseite neu ausgerichtet

- Ziel: Die 10.000-Schritte-Challenge einfacher, direkter und weniger wie ein
  Trainingsprogramm darstellen.
- Aenderungen: Hero-Subline, Zieltext, Regeln, Tipps und FAQ geschaerft;
  Aufbauplan und grosse Wissenschaftssektion fuer diese Challenge ausgeblendet;
  Ranking mit Top 20 plus eigener Position, Reststrecken-Rechner,
  Kalorien-/Jahresrechnung und Wissenswertes zu Schritten ergaenzt;
  Detailseiten-Standardreihenfolge auf Ranking, Q&A, Challenge Mate und danach
  Content umgestellt.
- Verifikation: `npm run lint`, `npm run build`; lokale Playwright-Screenshots
  fuer Desktop und Mobile; DOM-Check bestaetigt neue Reihenfolge, Rechner,
  Wissenssektion, entfernten Aufbauplan und entfernte alte Wissenschaftsheadline.
- Offene Risiken: Ranking-Daten sind aktuell statisch und muessen spaeter an
  echte Teilnahme-/Streak-Daten angebunden werden.
- Naechster Schritt: Aenderung committen und auf die Testdomain deployen, wenn
  Stefan die neue Detailseite live abnehmen moechte.
