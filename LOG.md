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
