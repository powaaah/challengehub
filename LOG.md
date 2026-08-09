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

## 2026-07-03 - Challenge-Detailstruktur auf Testdomain deployed

- Ziel: Neue Detailseiten-Struktur und 10.000-Schritte-Umbau live auf
  `theovina.de` sichtbar machen.
- Aenderungen: Commit `257d01d` nach GitHub gepusht, VPS-Checkout per
  Fast-Forward aktualisiert, Dependencies installiert, frischen Next.js-Build
  erzeugt und bestehenden `challengehub`-Service neu gestartet.
- Verifikation: `https://theovina.de/challenges/10000-schritte-am-tag` liefert
  HTTP 200; Live-DOM-Check bestaetigt Ranking, Q&A, Challenge-Mate-CTA, Ziel und
  Rechner in der gewuenschten Reihenfolge; alter Aufbauplan und alte
  Wissenschaftsheadline sind nicht mehr vorhanden.
- Offene Risiken: Ranking-Daten sind weiterhin statisch; `npm ci` meldet
  weiterhin zwei moderate Audit-Funde; `.next`-Bereinigung meldete bekannte
  Permission-Warnungen fuer alte Cache-Bilder, Build war erfolgreich.
- Naechster Schritt: Visuelle Abnahme auf der Testdomain.

## 2026-07-03 - Challenge-Detailseiten-Pulse-Grid verfeinert

- Ziel: Stefans Feedback zu Start-Popup, Community-Q&A, kompakterem Ranking,
  dreispaltigem Top-Grid und Schritte-Rechner umsetzen.
- Aenderungen: Startbutton startet ohne Sicherheits-Checkbox und zeigt ein
  motivierendes `Du bist drin`-Popup; Ranking, Q&A und Challenge Mate in ein
  gemeinsames Pulse-Grid gesetzt; Ranking als kompakte Tabelle mit Scrollbereich
  gestaltet; Q&A als Community-Fragen mit Top-Antwort nach Likes modelliert;
  Schritte-Rechner von manueller Schrittlaenge auf Koerpergroesse plus
  Naeherungsformel `Koerpergroesse x 0,414` umgestellt.
- Verifikation: `npm run lint`, `npm run build`; lokale Playwright-Screenshots
  fuer Desktop und Mobile; Start-Popup per Browser-Check getestet.
- Offene Risiken: Q&A, Likes, Ranking und Challenge-Mate-Matching sind weiterhin
  statische UI-Modelle und noch nicht an echte Nutzerdaten angebunden.
- Naechster Schritt: Visuelle Abnahme lokal oder Deploy auf Testdomain.

## 2026-07-04 - Pulse-Grid-Detailseite deployed

- Ziel: Die verfeinerte Challenge-Detailseite mit Pulse-Grid und neuem
  Start-Popup auf `theovina.de` live stellen.
- Aenderungen: Commit `23b6483` nach GitHub gepusht, VPS-Checkout per
  Fast-Forward aktualisiert, Dependencies installiert, frischen Next.js-Build
  erzeugt und bestehenden `challengehub`-Service neu gestartet.
- Verifikation: `https://theovina.de/challenges/10000-schritte-am-tag` liefert
  HTTP 200; Server-Checkout steht auf `23b6483`; Live-Browsercheck bestaetigt
  `Streak Leaderboard`, `Community-Fragen`, `Challenge Mate finden`,
  `Koerpergroesse in cm`, Formel `0,414` und neues `Du bist drin`-Popup ohne
  Sicherheits-Checkbox.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde;
  `.next`-Bereinigung meldete bekannte Permission-Warnungen fuer alte
  Cache-Bilder; Q&A/Ranking/Mate-Daten sind weiterhin statische UI-Modelle.
- Naechster Schritt: Visuelle Abnahme auf der Testdomain und danach echte
  Datenanbindung fuer Ranking/Q&A/Mate planen.

## 2026-07-04 - Site-Shell und CSS-Stueckwerk bereinigt

- Ziel: Lokale Header-/Footer-Sonderfaelle und stueckwerkhafte CSS-Basis
  projektweit entfernen.
- Aenderungen: `components/site-shell.tsx` und `site-shell.module.css`
  eingefuehrt; alle Seitentypen auf gemeinsamen `SiteHeader`/`SiteFooter`
  umgestellt; lokale Header-Funktionen und Header-CSS aus Detailseiten, Wissen,
  Legal, Auth, Meine Challenges und Challenge-Erstellung entfernt; eingeloggtes
  Profilmenue auf Inhaltsseiten vereinheitlicht; globale Layout-Tokens fuer
  Content-Breite, Gutter, Radien und Focus-Ring ergaenzt; alte `/#challenges`-
  Backlinks auf `/challenges` korrigiert.
- Verifikation: `npm run lint`, `npm run build`; lokaler Produktionsstart mit
  `npm run start -- --port 3001`; Playwright-Smoke-Test auf Desktop 1440px und
  Mobile 390px ueber Startseite, Katalog, Detailseite, Erstellung, Auth, Wissen,
  Wissensartikel, Sicherheit, Datenschutz, Impressum, Karriere und
  Challenge-Mate. Geprueft wurden genau ein Top-Level-Header, Footer, keine
  alten Anchor-Links und kein horizontaler Overflow.
- Offene Risiken: Build meldet weiterhin die bekannte Node-SQLite-
  Experimentalwarnung.
- Naechster Schritt: Commit nach GitHub pushen und Testdomain deployen.

## 2026-07-04 - Site-Shell-Konsolidierung deployed

- Ziel: Bereinigte gemeinsame Site-Shell auf der Testdomain live stellen.
- Aenderungen: Commit `6f78bf1` (`refactor: consolidate site shell`) nach
  GitHub gepusht, VPS-Checkout per Fast-Forward aktualisiert, `npm ci` und
  `npm run build` ausgefuehrt, bestehenden `challengehub`-Service neu
  gestartet.
- Verifikation: `https://theovina.de/`, `/challenges`,
  `/challenges/10000-schritte-am-tag`, `/wissen`, `/sicherheit`,
  `/datenschutz`, `/impressum` und `/karriere` liefern HTTP 200; Live-
  Playwright-Smoke-Test auf Desktop 1440px und Mobile 390px ueber 11 Routen
  bestaetigt genau einen Top-Level-Header, Footer, keine alten `/#challenges`-
  oder `/#ranking`-Links und keinen horizontalen Overflow.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde; im
  Container-Log-Tail steht noch eine alte Server-Action-Anfrage aus einem
  frueheren Build, der aktuelle Start war sauber.
- Naechster Schritt: Visuelle Abnahme der Testdomain.

## 2026-07-04 - Fake-Community-Daten entfernt

- Ziel: Challenge-Seiten nur noch mit echten Daten bzw. ehrlichen Leerzustaenden
  darstellen und Q&A vorerst entfernen.
- Aenderungen: Statische Community-Q&A-Komponente entfernt; FAQPage-JSON-LD von
  Challenge-Detailseiten entfernt; erfundene Leaderboard-Namen, Streaks, Likes
  und eigene Beispielposition entfernt; Activity-Bereich durch echte
  Datenlage, Ranking-Leerzustand und ehrlichen Challenge-Mate-Leerzustand
  ersetzt; ungenutzte Q&A-/Ranking-CSS bereinigt.
- Verifikation: `npm run lint`, `npm run build`; lokaler Produktionsstart mit
  `npm run start -- --port 3002`; Playwright-DOM-Check auf Desktop 1440px und
  Mobile 390px fuer `/challenges/10000-schritte-am-tag` bestaetigt keine
  Q&A-Texte, keine Fake-Namen/Likes, kein `FAQPage`-Schema und keinen
  horizontalen Overflow.
- Offene Risiken: Echte Ranking-, Stadt-, Mate- und Durchhaltequoten-Daten sind
  noch nicht serverseitig angebunden; Build meldet weiterhin die bekannte
  Node-SQLite-Experimentalwarnung.
- Naechster Schritt: Teilnahme-/Check-in-Persistenz fachlich klaeren und danach
  echte Durchhaltequoten wie 30/180/365 Tage anzeigen.

## 2026-07-05 - Fake-Community-Daten deployed

- Ziel: Challenge-Detailseiten ohne simulierte Q&A-, Ranking- oder Mate-Daten
  auf der Testdomain ausliefern.
- Aenderungen: Commit `dbcef22` nach GitHub gepusht, VPS-Checkout per
  Fast-Forward aktualisiert, `npm ci` und `npm run build` ausgefuehrt,
  bestehenden `challengehub`-Service neu gestartet.
- Verifikation: `https://theovina.de/challenges/10000-schritte-am-tag`,
  `/challenges` und `/` liefern HTTP 200; Live-Playwright-Check auf Desktop
  1440px und Mobile 390px bestaetigt keine Q&A-Texte, keine Fake-Namen/Likes,
  kein `FAQPage`-Schema, vorhandene ehrliche Leerzustaende und keinen
  horizontalen Overflow.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde; im
  Container-Log-Tail stehen alte Server-Action-Anfragen aus vorherigen Builds,
  der aktuelle Next-Start war sauber.
- Naechster Schritt: Echte serverseitige Teilnahme-/Check-in-Daten fuer
  Durchhaltequoten und Ranglisten planen.

## 2026-07-05 - Teilnahme-CTA auf Challenge-Seiten

- Ziel: Den Teilnahme-Button auf Challenge-Detailseiten sofort sichtbar machen.
- Aenderungen: Hero-CTA fuer kuratierte, serverseitige und lokale
  User-Challenges ergaenzt; Buttontext auf `Jetzt teilnehmen` umgestellt; CTA
  vor die Kennzahlen gesetzt, damit Starten der Challenge klar primaere Aktion
  ist.
- Verifikation: `npm run lint`, `npm run build`; lokaler Produktionsstart mit
  `npm run start -- --port 3010`; Playwright-Smoke-Test auf Desktop 1440px und
  Mobile 390px fuer `/challenges/10000-schritte-am-tag`,
  `/challenges/100-burpees-pro-tag` und `/challenges/30-tage-ohne-zucker`
  bestaetigt sichtbaren CTA im ersten Viewport, keinen horizontalen Overflow
  und erfolgreichen Start-Flow mit Modal und Link zu `Meine Challenges`.
- Offene Risiken: Build meldet weiterhin die bekannte Node-SQLite-
  Experimentalwarnung; der erste Buildversuch wurde von einem alten lokalen
  `next start`-Prozess blockiert und nach Stoppen des Prozesses erfolgreich
  wiederholt.
- Naechster Schritt: Bei Freigabe auf die Testdomain deployen.

## 2026-07-05 - Teilnahme-CTA deployed

- Ziel: Den sichtbaren Hero-CTA auf der Testdomain ausliefern.
- Aenderungen: Commit `aa36b3f` nach GitHub gepusht, VPS-Checkout per
  Fast-Forward aktualisiert, `npm ci` und `npm run build` auf dem VPS
  ausgefuehrt, bestehenden `challengehub`-Service neu gestartet.
- Verifikation: Live-Playwright-Test auf `https://theovina.de` fuer
  `/challenges/10000-schritte-am-tag`, `/challenges/100-burpees-pro-tag` und
  `/challenges/30-tage-ohne-zucker` auf Desktop 1440px und Mobile 390px:
  HTTP 200, `Jetzt teilnehmen` im ersten Viewport, kein horizontaler Overflow,
  Start-Modal und anschliessender Link zu `Meine Challenges` funktionieren.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde.
- Naechster Schritt: Visuelle Abnahme der Testdomain.

## 2026-07-05 - Challenge-Statusleiste statt Datenlage-Panel

- Ziel: Den Bereich unter dem Hero weniger technisch und weniger ablenkend
  gestalten.
- Aenderungen: Altes Teilnahme-Panel mit `Echte Datenlage` und langem
  Erklaertext entfernt; kompakte Kennzahlen-Leiste direkt unter dem Hero
  eingefuehrt; Hero-Hoehe und H1-Groesse reduziert; Hero-CTA farblich staerker
  hervorgehoben; Ranking und Challenge-Mate darunter zweispaltig angeordnet;
  ungenutzte alte Statistik-CSS-Regeln entfernt.
- Verifikation: `npm run lint`, `npm run build`; lokaler Produktionsstart mit
  `npm run start -- --port 3011`; Playwright-Smoke-Test auf Desktop 1440px und
  Mobile 390px fuer `/challenges/100-burpees-pro-tag` und
  `/challenges/10000-schritte-am-tag` bestaetigt entfernten `Echte Datenlage`-
  Text, sichtbare Statusleiste, sichtbaren CTA, Ranking darunter und keinen
  horizontalen Overflow.
- Offene Risiken: Build meldet weiterhin die bekannte Node-SQLite-
  Experimentalwarnung; Durchhaltequoten bleiben bis zur echten serverseitigen
  Check-in-Anbindung als `noch nicht erfasst` markiert.
- Naechster Schritt: Visuelle Abnahme und danach bei Freigabe deployen.

## 2026-07-05 - Option-B-Hero mit Ranking rechts

- Ziel: Den Fokus im Challenge-Hero staerker auf `Jetzt teilnehmen` legen und
  Ranking/Wettbewerb trotzdem sofort sichtbar halten.
- Aenderungen: Hero von farbdominanter Challenge-Flaeche auf neutrale helle
  Flaeche umgestellt; 2/3-1/3-Grid eingefuehrt; Challenge-Info und CTA links,
  Ranking-Panel rechts; Level-Farbe nur noch als dezente obere Akzentkante;
  CTA wieder als blauer Hauptbutton hervorgehoben; Ranking-Panel kompakter mit
  echten Startzahlen und ehrlichem Leerzustand formuliert; Challenge-Mate unter
  der Statusleiste als separate Flaeche belassen.
- Verifikation: `npm run lint`, `npm run build`; lokaler Produktionsstart mit
  `npm run start -- --port 3012`; Playwright-Smoke-Test auf Desktop 1440px und
  Mobile 390px fuer `/challenges/100-burpees-pro-tag` und
  `/challenges/10000-schritte-am-tag` bestaetigt Ranking rechts neben dem CTA
  auf Desktop, sauberes Stapeln auf Mobile, entfernten `Echte Datenlage`-Text
  und keinen horizontalen Overflow.
- Offene Risiken: Build meldet weiterhin die bekannte Node-SQLite-
  Experimentalwarnung; Ranglisten bleiben bis zur echten Check-in-Anbindung
  ohne Personen/Platzierungen.
- Naechster Schritt: Visuelle Abnahme und danach deployen.

## 2026-07-05 - Ranking-Tabelle mit lokaler Quote

- Ziel: Das Ranking im Hero als hochwertige Tabelle darstellen und fuer
  Dauer-Challenges eine echte Durchfuehrungsquote seit Start anzeigen.
- Aenderungen: Client-Komponente `ChallengeRankingTable` ergaenzt; Ranking-
  Panel zeigt jetzt eine Tabelle mit Teilnehmer, Streak, erledigten Tagen und
  Quote; bei lokal gestarteter Challenge werden echte Browserdaten aus
  `challengehub.activeChallenges.v1` genutzt; Quote wird als Check-in-Tage
  geteilt durch Kalendertage seit Start berechnet; ohne lokale Teilnahme bleibt
  eine leere Tabellenzeile ohne Fake-Namen sichtbar.
- Verifikation: `npm run lint`, `npm run build`; lokaler Produktionsstart mit
  `npm run start -- --port 3012`; Playwright prueft leeren Desktop-Zustand und
  mobilen Zustand mit lokaler Testteilnahme. Testfall mit 3 Check-ins in 4
  Tagen zeigt korrekt `75%` und `3/4`, kein horizontaler Overflow.
- Offene Risiken: Ranking ist weiterhin nur lokal fuer den eigenen Stand
  befuellt; globale Plaetze, Staedte und andere Personen warten auf echte
  serverseitige Check-in-/Profil-Daten.
- Naechster Schritt: Visuelle Abnahme und danach deployen.

## 2026-07-07 - Pflichtenheft aus ChallengeHub-Lastenheft abgeleitet

- Ziel: Das Produkt-Lastenheft in einen konkreten Umsetzungsplan fuer den
  bestehenden Next.js-/SQLite-Stand uebersetzen.
- Aenderungen: `challengehub-pflichtenheft.md` erstellt; bestehende Basis,
  MVP-Scope, Informationsarchitektur, Datenmodell-Erweiterungen, Server Actions,
  Challenge-Raum, Rankinglogik, Slices, Akzeptanzkriterien, Migration vom
  LocalStorage-MVP und Definition of Done dokumentiert; `TODOS.md` um
  Pflichtenheft-Abschluss und naechsten Server-MVP-Slice ergaenzt.
- Verifikation: Dokument gegen `challengehub-lastenheft.md`, aktuelles
  `lib/db.ts`, `lib/auth.ts`, Challenge-Detailseiten und lokale
  Check-in-Komponenten abgeglichen.
- Offene Risiken: `challengehub-lastenheft.md` ist neu im Projektordner und
  sollte mit dem Pflichtenheft versioniert werden; die letzten UI-/Ranking-
  Commits sind weiterhin lokal ahead und noch nicht deployed.
- Naechster Schritt: Pflichtenheft fachlich abnehmen, danach Server-MVP-Slice
  fuer offene Dauer-Challenge beginnen.

## 2026-07-07 - Server-MVP-Produktentscheidungen dokumentiert

- Ziel: Stefans fachliche Entscheidungen fuer den ersten Server-MVP verbindlich
  ins Pflichtenheft uebernehmen.
- Aenderungen: Erste MVP-Challenge auf `10.000 Schritte am Tag` festgelegt;
  Login-Pflicht und Login-Popup fuer nicht eingeloggte Startversuche
  dokumentiert; Check-in-Button auf `Challenge heute durchgefuehrt`
  festgelegt; verpasste Tage als automatische Berechnung definiert;
  Challenge-Raum unter `/meine-challenges/[id]` als Teilnahme-Kontext
  erklaert; Freund-einladen als naechster Slice nach Server-Check-in
  eingeordnet; `TODOS.md` aktualisiert.
- Verifikation: Dokument-Review per Diff; keine Build-/Lint-Pruefung, da nur
  Dokumentation geaendert wurde.
- Offene Risiken: Visuelles Login-Popup und serverseitiger Challenge-Flow sind
  noch nicht implementiert.
- Naechster Schritt: Server-MVP fuer 10.000-Schritte-Teilnahme, Check-in,
  Challenge-Raum und Ranking umsetzen.

## 2026-07-07 - ChallengeHub-Testdomain mit Hero-/Ranking-Stand aktualisiert

- Ziel: Den aktuellen lokalen Stand mit neutralem Challenge-Hero,
  Ranking-Tabelle und Pflichtenheft auf die Testdomain deployen.
- Aenderungen: Lokale Commits bis `f7ebf78` nach GitHub `main` gepusht; VPS-
  Checkout `/home/stefan/projects/challengehub` per Fast-Forward aktualisiert;
  `npm ci` und `npm run build` auf dem Server ausgefuehrt; bestehenden
  `challengehub`-Service neu gestartet.
- Verifikation: Lokal `npm run lint` und `npm run build` erfolgreich; live
  liefern `https://theovina.de/`, `/challenges`,
  `/challenges/10000-schritte-am-tag`, `/challenges/100-burpees-pro-tag` und
  `/meine-challenges` HTTP 200; Marker `Jetzt teilnehmen`, `Ranking`, `Quote`
  und `10.000 Schritte am Tag` auf der 10.000-Schritte-Seite bestaetigt.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde; echte
  serverseitige Teilnahme und Check-ins sind noch nicht umgesetzt.
- Naechster Schritt: Server-MVP fuer 10.000-Schritte-Teilnahme beginnen.

## 2026-07-07 - Server-MVP-Slice 1 fuer Challenge-Teilnahme

- Ziel: `Jetzt teilnehmen` fuer die 10.000-Schritte-Challenge mit Login-
  Pflicht, serverseitiger Teilnahme, Challenge-Raum und heutigem Check-in
  nutzbar machen.
- Aenderungen: Challenge-Start von LocalStorage auf Server Action umgestellt;
  Login-Popup fuer ausgeloggte Nutzer nach ChallengeHub-Vorgabe ergaenzt;
  kuratierte Challenges intern in SQLite aufloesbar gemacht; Teilnahme in
  `participations` gespeichert; `/meine-challenges/[id]` als persoenlicher
  Challenge-Raum angelegt; heutiger Check-in schreibt in `check_ins`;
  `/meine-challenges` zeigt serverseitige Teilnahmen zusaetzlich zum alten
  lokalen Fallback.
- Verifikation: `npm run lint`; `npm run build` nach frischem `.next`-
  Verzeichnis erfolgreich; lokaler Production-Server auf Port 3013; Playwright-
  Smoke-Test fuer ausgeloggtes Login-Popup, Registrierung, Challenge-Start,
  Redirect in Raum, `Challenge heute durchgefuehrt`-Check-in, Quote `100%` und
  Dashboard-Link erfolgreich; Mobile-Check 390px ohne horizontalen Overflow.
- Offene Risiken: Ranking und Streak nutzen noch nicht serverseitige Check-ins;
  LocalStorage-Fallback ist noch sichtbar; Passwort-vergessen-Link fuehrt
  vorerst zur Auth-Seite, weil kein Reset-Flow existiert.
- Naechster Schritt: Serverseitige Ranking-/Streak-Berechnung fuer die
  10.000-Schritte-Challenge anbinden.

## 2026-07-07 - Server-MVP-Slice 1 deployed

- Ziel: Den neuen serverseitigen Teilnahme-/Check-in-Slice auf die Testdomain
  deployen.
- Aenderungen: Commit `dd53e99` nach GitHub `main` gepusht; VPS-Checkout per
  Fast-Forward aktualisiert; `npm ci` und `npm run build` auf dem Server
  ausgefuehrt; bestehenden `challengehub`-Service neu gestartet.
- Verifikation: `https://theovina.de/`, `/challenges`,
  `/challenges/10000-schritte-am-tag` und `/meine-challenges` liefern HTTP 200;
  Server steht auf `dd53e99`; Live-Playwright-Test auf Mobile bestaetigt
  Login-Popup, Registrierung, Challenge-Start, Redirect in
  `/meine-challenges/[id]`, `Challenge heute durchgefuehrt`-Check-in,
  `Heute gespeichert`, Quote `100%` und keinen horizontalen Overflow.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde; Ranking
  und Streak sind noch nicht serverseitig aus Check-ins angebunden.
- Naechster Schritt: Server-Ranking und Streak-Berechnung aus echten Check-ins
  umsetzen.

## 2026-07-07 - Echte Daten fuer sichtbare Challenge-Kennzahlen

- Ziel: Stefans Hinweis korrigieren, dass keine Test- oder statischen Fake-
  Werte als echte Challenge-Daten erscheinen duerfen.
- Aenderungen: Live-Testaccount `deploy-...@example.test` aus der VPS-DB
  entfernt; durch Cascades wurden dessen Participation und Check-in ebenfalls
  entfernt; lokale Testaccounts entfernt; sichtbare Teilnehmerzahlen auf echte
  DB-Counts aus `participations` umgestellt; statische Bewertungszahlen aus
  Hero, Katalog, Startseite und Sortierung entfernt; Hero-Ranking liest nicht
  mehr aus LocalStorage, sondern zeigt bis zur Server-Ranking-Anbindung einen
  ehrlichen Leerzustand.
- Verifikation: VPS-DB vor Cleanup nach `/home/stefan/backups/challengehub/`
  gesichert; nach Cleanup keine Test-User, keine Test-Participations und keine
  Test-Check-ins in der Live-DB; `rg` findet keine alten sichtbaren Fake-Marker
  wie `65 Teilnehmer`, `4.8/5`, `Bewertung ab`, `sort=rating` oder lokale
  Ranking-Texte.
- Offene Risiken: Serverseitiges Ranking und Streak-Berechnung sind weiterhin
  der naechste fachliche Schritt.
- Deploy/Live-Verifikation: Commit `6b87e36` deployed; Server-Build und
  Service-Restart erfolgreich; live liefern `/`, `/challenges` und
  `/challenges/10000-schritte-am-tag` HTTP 200; alte Marker `65 Teilnehmer`
  und `4.8/5` sind live nicht mehr enthalten; Bewertungs-Leerzustand ist
  sichtbar; Live-DB hat `test_users=0`, `participations=0`, `check_ins=0`.
- Naechster Schritt: Server-Ranking und Streak-Berechnung aus echten Check-ins
  umsetzen.

## 2026-07-07 - Login-Popup optisch bereinigt

- Ziel: Den Login-Dialog auf Challenge-Seiten deutlich ruhiger und hochwertiger
  gestalten.
- Aenderungen: Close-Button von grosser blauer Flaeche auf kleines Icon
  reduziert; Modal schmaler und kompakter gemacht; Header mit Logo, Kicker,
  Headline und Intro sauber gruppiert; Formularfelder und Anmeldebutton
  konsistenter gestaltet; Modal-Regeln gegen die allgemeinere Hero-Button-CSS-
  Regel abgeschirmt.
- Verifikation: `npm run lint`, `npm run build`; lokaler Production-Server auf
  Port 3013; Playwright-Check auf 1366px und 390px bestaetigt sichtbaren Dialog,
  keinen horizontalen Overflow und Close-Button mit 34x34px statt blauem
  Hero-Button; Mobile-Screenshot unter `output/playwright/login-modal-mobile.png`.
- Offene Risiken: Kein Passwort-Reset-Flow vorhanden; der Link fuehrt weiter
  zur Auth-Seite.
- Naechster Schritt: UI-Korrektur deployen.

## 2026-07-08 - Challenge-Detailseiten vereinfacht und deployed

- Ziel: Challenge-Unterseiten konsequent auf Wettbewerb fokussieren und das
  Stueckwerk aus Nutzen-, Risiko-, Trainingsplan- und Leerzustandsbloecken
  entfernen.
- Aenderungen: Statische Challenge-Detailseiten auf Hero, Regeln, Top-10-
  Ranking und SEO-Info reduziert; `ChallengeMate finden` als sekundaren
  Outline-CTA platziert; echte Teilnahme server- und UI-seitig auf
  `10.000 Schritte am Tag` begrenzt; andere Starts zeigen `Bald verfuegbar`;
  Ranking zeigt eine kompakte Top-10-Tabelle mit ehrlichem Leerzustand; alte
  Bewertungs-/Noch-nicht-erfasst-Texte im Katalog bereinigt.
- Verifikation: `npm run lint`, `npm run build`; lokaler Browser-Smoke-Test auf
  1366px und 390px fuer `/challenges/100-burpees-pro-tag` und
  `/challenges/10000-schritte-am-tag` ohne horizontalen Overflow und ohne alte
  Textmarker.
- Deploy/Live-Verifikation: Commit `a313ca4` nach GitHub `main` gepusht;
  VPS-Checkout per Fast-Forward aktualisiert; `npm ci`, `npm run build` und
  Restart von `challengehub` erfolgreich; live liefern beide Detailseiten HTTP
  200, Burpees zeigt `Bald verfuegbar`, 10.000 Schritte zeigt `Jetzt
  teilnehmen`, beide zeigen `Top 10`; Live-Browsercheck auf 1366px und 390px
  ohne Overflow und ohne alte Textmarker.
- Offene Risiken: `npm ci` meldet weiterhin zwei moderate Audit-Funde; echte
  Ranking-Daten/Streaks/Quoten muessen weiterhin aus serverseitigen Check-ins
  berechnet werden.
- Naechster Schritt: Server-Ranking fuer die 10.000-Schritte-Challenge aus
  echten Check-ins ableiten.

## 2026-07-08 - Challenge-Detailseiten optisch nachgeschaerft

- Ziel: Die stark bereinigte Challenge-Seite visuell ansprechender machen,
  ohne wieder in bunte, ablenkende Module zurueckzufallen.
- Aenderungen: Hero in eine kompakte Scoreboard-Flaeche mit klarer CTA-Zone,
  Kennzahlen und Wettbewerbsbox umgebaut; Ranking als primaeres Modul mit
  besserem Leerzustand gestaltet; Regeln als kompaktes Nebenpanel gesetzt;
  SEO-Info optisch weiter nachrangig gehalten; Tabellenstil verdichtet.
- Verifikation: `npm run lint`, `npm run build`; lokaler Browser-Smoke-Test
  auf 1366px und 390px fuer `/challenges/100-burpees-pro-tag` ohne
  horizontalen Overflow, mit sichtbarem `Top 10` und `Ranking ansehen`.
- Offene Risiken: Echte Ranking-Daten/Streaks/Quoten fehlen weiterhin, bis sie
  aus serverseitigen Check-ins berechnet werden.
- Naechster Schritt: Mit echten Ranking-Daten kann die Tabelle deutlich mehr
  soziale Spannung erzeugen.

## 2026-07-08 - 10.000-Schritte-Detailseite weiter entschlackt

- Ziel: Die Challenge-Detailseite weniger ueberladen machen und die Headline
  auf maximal zwei Zeilen begrenzen.
- Aenderungen: Hero auf Titel, direkte Challenge-Erklaerung und zwei CTAs
  reduziert; rechte Wettkampfbox, Kennzahlenleiste und separates Regeln-Panel
  entfernt; Beschreibung fuer die 10.000-Schritte-Challenge neu formuliert;
  Detailseiten-H1 und H2 per CSS auf maximal zwei Zeilen begrenzt.
- Verifikation: `npm run lint`; `npm run build`; lokaler Production-Smoke-Test
  auf 1366px und 390px fuer `/challenges/10000-schritte-am-tag` ohne
  horizontalen Overflow; H1 auf Desktop 1 Zeile und Mobile 2 Zeilen; alle H2
  maximal 2 Zeilen; entfernte Panels nicht mehr im DOM.
- Offene Risiken: Ranking bleibt bis zur Server-Ranking-Anbindung ein echter
  Leerzustand.
- Naechster Schritt: Seite nach Stefans visuellem Feedback ggf. noch weiter
  kuerzen, bevor echte Ranking-Daten eingebaut werden.
- Deploy: Commit `d70658d` nach GitHub `main` gepusht; VPS-Checkout
  `/home/stefan/projects/challengehub` per Fast-Forward aktualisiert;
  `npm ci`, `npm run build` und `docker compose restart challengehub`
  erfolgreich. Live auf `https://theovina.de/challenges/10000-schritte-am-tag`
  geprueft: HTTP 200, neuer Challenge-Text sichtbar, H1 Desktop 1 Zeile und
  Mobile 2 Zeilen, H2 maximal 2 Zeilen, keine entfernten Panels und kein
  horizontaler Overflow.

## 2026-07-08 - Header-Login als Popup umgesetzt

- Ziel: Der Login-Button im Header soll nicht mehr direkt auf die Loginseite
  navigieren, sondern denselben kompakten Login-Dialog wie der Challenge-Start
  oeffnen.
- Aenderungen: Login-Dialog in eine wiederverwendbare Komponente ausgelagert;
  Header-Login von Link auf Button mit Modal umgestellt; aktuelle URL wird als
  `next` im Login-Formular gesetzt; Challenge-Start verwendet dieselbe
  Login-Modal-Komponente; alte duplizierte Login-CSS aus
  `challenge-start.module.css` entfernt.
- Verifikation: `npm run lint`; `npm run build`; lokaler Production-Smoke-Test
  auf 1366px und 390px fuer `/challenges/10000-schritte-am-tag`: Header-Login
  oeffnet Dialog auf derselben URL, Formularfelder sichtbar, `next` zeigt auf
  die aktuelle Challenge-Seite, kein horizontaler Overflow.
- Offene Risiken: Registrierung und Passwort-vergessen fuehren weiterhin zur
  bestehenden `/auth`-Seite.
- Naechster Schritt: Bei Bedarf Registrierung spaeter ebenfalls als Popup
  auslagern.
- Deploy: Commit `3880e07` nach GitHub `main` gepusht; VPS-Checkout
  `/home/stefan/projects/challengehub` per Fast-Forward aktualisiert;
  `npm ci`, `npm run build` und `docker compose restart challengehub`
  erfolgreich. Live auf `https://theovina.de/challenges/10000-schritte-am-tag`
  geprueft: Header-Login oeffnet Dialog auf derselben URL, E-Mail- und
  Passwortfeld sichtbar, `next` zeigt auf die aktuelle Challenge-Seite, kein
  horizontaler Overflow auf 1366px und 390px.

## 2026-07-12 - SEO- und kontinuierliche Arbeitsweise priorisiert

- Ziel: Skalierbarkeit und spaetere iOS-/Android-App vorbereiten, ohne die
  organische Auffindbarkeit der Website zu gefaehrden, und ChallengeHub in
  kontinuierlichen Arbeitsschleifen weiterentwickeln.
- Aenderungen: `TODOS.md` um SEO als feste Architektur- und Abnahmeanforderung,
  den skalierbaren modularen Monolithen mit PostgreSQL/API, die spaetere
  Expo-App sowie eine kleine, getestete und dokumentierte Slice-Schleife
  erweitert.
- Verifikation: Markdown-Diff geprueft; keine Anwendungsaenderung vorgenommen.
- Offene Risiken: Intervall und Autonomiegrad einer automatisierten Schleife
  muessen mit Stefan festgelegt werden; produktive Deployments bleiben
  freigabepflichtig.
- Naechster Schritt: Ersten Architektur-Slice fuer PostgreSQL-Migration,
  Domainlogik und API planen, dabei SEO-Baseline als Regressionstest erfassen.

## 2026-07-12 - Echtes Server-Ranking und Fortschrittslogik

- Ziel: Den Kernloop der 10.000-Schritte-Challenge nach einem Check-in mit
  echtem Fortschritt, Streak, Quote und Wettbewerb schliessen.
- Aenderungen: Getestete Domainlogik fuer vergangene, erfuellte und verpasste
  Tage, aktuelle/laengste Serie und Durchhaltequote angelegt; aktive
  Teilnahmen und Check-ins serverseitig zum Challenge-Ranking zusammengefuehrt;
  Sortierung nach aktueller Serie, Quote, erfuellten Tagen und Startdatum
  umgesetzt; Challenge-Detailseite zeigt echte Top-10-Daten; persoenlicher
  Challenge-Raum zeigt beide Streaks, Quote, Fehl-Tage, Rang und markiert den
  eigenen Rankingeintrag. `npm test` als Projektcheck eingefuehrt.
- Verifikation: Test zuerst gegen fehlende Domainlogik fehlschlagen lassen;
  danach 5/5 Node-Tests erfolgreich; `npm run lint` und `npm run build`
  erfolgreich; lokaler Browser-Smoke-Test der oeffentlichen Detailseite mit
  korrektem SEO-Titel, Top-10-Tabelle und ehrlichem Leerzustand erfolgreich;
  `git diff --check` ohne Fehler.
- Offene Risiken: SQLite und dessen Node-API bleiben experimentell; Ranking wird
  fuer den MVP bei jedem Seitenaufruf aus Check-ins berechnet und braucht vor
  grosser Last PostgreSQL, Indizes und spaeter Aggregation/Cache. Der alte
  LocalStorage-Bereich in `/meine-challenges` ist noch vorhanden.
- Naechster Schritt: LocalStorage-Fallback entfernen und danach den
  Freund-herausfordern-Slice mit sicheren Einladungstokens umsetzen.

## 2026-07-12 - Meine Challenges vollstaendig serverseitig

- Ziel: Den alten LocalStorage-Fallback aus dem Account-Dashboard entfernen,
  damit eingeloggte Nutzer nur noch ihre serverseitig gespeicherten Teilnahmen
  sehen und bearbeiten.
- Aenderungen: `MyChallengesApp` von lokaler Client-State-/Storage-Logik auf eine
  serverseitig renderbare Darstellung der DB-Teilnahmen reduziert; lokale
  Check-in-, Entfernen- und Fortschrittsaktionen samt ungenutztem CSS entfernt;
  Dashboard-Intro, Leerzustand und Metadata-Description auf den Server-Flow
  angepasst; Todo abgeschlossen.
- Verifikation: `npm test` mit 5/5 bestandenen Tests, `npm run lint`,
  `npm run build` und `git diff --check` erfolgreich. Lokaler Production-Smoke-
  Test bestaetigt fuer `/meine-challenges` ohne Sitzung den erwarteten HTTP-307-
  Redirect auf `/auth?next=/meine-challenges`. Die oeffentliche Challenge-Seite
  rendert weiterhin Titel, Canonical, JSON-LD und H1 serverseitig.
- Offene Risiken: Die bereits vorhandenen URLs `/robots.txt` und `/sitemap.xml`
  liefern noch 404; das ist keine Regression dieser Dashboard-Slice, sollte
  wegen der festgelegten SEO-Abnahme aber als naechste kleine Slice behoben
  werden. SQLite und die Node-API bleiben experimentell.
- Naechster Schritt: Dynamische Next.js-Metadata-Routen fuer `robots.txt` und
  `sitemap.xml` mit Tests fuer kanonische, indexierbare URLs ergaenzen.

## 2026-07-12 - Crawlbare Sitemap und Robots-Regeln

- Ziel: Die bisher fehlenden SEO-Basisendpunkte `robots.txt` und `sitemap.xml`
  als kleine, testbare Slice bereitstellen.
- Aenderungen: Next.js-Metadata-Routen fuer Robots und Sitemap angelegt;
  nicht-oeffentliche Account-, Teilnahme-, Mate- und Erstellungsbereiche fuer
  Crawler ausgeschlossen; kanonische URLs fuer oeffentliche Seiten, kuratierte
  Challenges und Wissensartikel aufgenommen; veroeffentlichte DB-Challenges
  werden dynamisch ergaenzt und Slug-Duplikate entfernt; Sitemap-Logik in einer
  getrennt testbaren SEO-Hilfsschicht gebuendelt.
- Verifikation: `npm test` mit 7/7 bestandenen Tests; `npm run lint` ohne Fehler
  (drei Warnungen ausschliesslich aus dem bereits vorhandenen unversionierten
  `.next-locked-20260712-0640`-Buildartefakt); `npm run build` erfolgreich und
  beide Metadata-Routen im Route-Manifest; lokaler Production-Smoke-Test liefert
  die erwarteten Robots-Regeln sowie kanonische Challenge-/Wissens-URLs in der
  XML-Sitemap.
- Offene Risiken: SQLite/`node:sqlite` bleibt experimentell; die Sitemap liest
  veroeffentlichte DB-Challenges bei jedem Aufruf und sollte beim PostgreSQL-
  Umbau in die geplante Datenzugriffsschicht wandern. Rechtstexte sind weiterhin
  nicht final freigegeben.
- Naechster Schritt: Als naechste Architektur-Slice eine versionierte
  PostgreSQL-Migrationsbasis und klare Repository-Grenze vorbereiten, ohne den
  laufenden SQLite-MVP sofort umzuschalten.

## 2026-07-12 - Versionierte PostgreSQL-Ausgangsmigration

- Ziel: Den ersten kleinen Architektur-Slice des modularen Monolithen schaffen,
  ohne den laufenden SQLite-MVP oder die crawlbare Next.js-Oberflaeche
  umzuschalten.
- Aenderungen: Transaktionale Migration `0001_initial.sql` fuer Nutzer,
  Sessions, Challenges, Teilnahmen und Check-ins angelegt; PostgreSQL-Typen,
  Fremdschluessel, fachliche Checks und Indizes fuer bestehende Lesewege
  definiert; `schema_migrations`-Ledger und unveraenderliche
  Dateinamenskonvention dokumentiert; automatisierte Strukturtests ergaenzt.
- Verifikation: `npm test` mit 9/9 bestandenen Tests; `npm run lint` ohne Fehler
  (sechs Warnungen nur aus zwei bereits vorhandenen unversionierten
  `.next-locked-*`-Buildartefakten); `npm run build` erfolgreich, inklusive
  serverseitiger dynamischer Seiten sowie `robots.txt` und `sitemap.xml` im
  Route-Manifest.
- Offene Risiken: Die Migration wurde mangels freigegebener PostgreSQL-Instanz
  nicht gegen einen echten Server angewendet; SQLite bleibt weiterhin der
  Runtime-Adapter und `node:sqlite` experimentell. Datenuebernahme und
  Produktionsumschaltung sind bewusst nicht Teil dieser Slice.
- Naechster Schritt: Eine schmale Repository-Schnittstelle fuer oeffentliche
  Challenge-Lesezugriffe einfuehren und den bestehenden SQLite-Zugriff als
  Adapter dahinter verschieben, ohne URLs oder serverseitiges Rendering zu
  aendern.

## 2026-07-12 - Repository-Grenze fuer oeffentliche Challenges

- Ziel: Den oeffentlichen Challenge-Leseweg als kleine Architektur-Slice aus
  dem monolithischen SQLite-Modul loesen, ohne Runtime, URLs oder SEO-Ausgabe zu
  veraendern.
- Aenderungen: Frameworkfreies Domainmodell samt `PublicChallengeRepository`
  angelegt; konkrete SQL-Abfragen und Row-Mapping in einen getesteten
  `SqlitePublicChallengeRepository` verschoben; schmale Anwendungsschnittstelle
  fuer Katalog, Detailseite und Sitemap eingefuehrt; UI-Typen vom Datenbankmodul
  entkoppelt. SQLite bleibt bewusst der aktive Adapter.
- Verifikation: `npm test` mit 11/11 bestandenen Tests, darunter zwei neue
  Adaptertests fuer Published-/Visibility-Filter und Domain-Mapping;
  `npm run lint` ohne Fehler (neun Warnungen nur aus drei vorhandenen
  unversionierten `.next-locked-*`-Artefakten); `npm run build` erfolgreich;
  lokaler Production-Smoke bestaetigt serverseitiges H1, Title, Canonical,
  JSON-LD, Challenge-Katalog und kanonischen Sitemap-Eintrag; `git diff --check`
  erfolgreich.
- Offene Risiken: Das alte `lib/db.ts` enthaelt weiterhin Account-, Teilnahme-
  und Schreibzugriffe; der Adapter nutzt weiter experimentelles `node:sqlite`.
  PostgreSQL-Umschaltung und Datenmigration waren bewusst nicht Teil der Slice.
- Naechster Schritt: Eine versionierte Read-API fuer oeffentliche
  Challenge-Daten auf Basis der neuen Repository-Grenze bereitstellen.

## 2026-07-13 - Versionierte Read-API fuer oeffentliche Challenges

- Ziel: Einen stabilen ersten Web-/App-Vertrag fuer oeffentliche
  Challenge-Daten bereitstellen, ohne die serverseitig crawlbare Weboberflaeche
  oder den laufenden SQLite-Adapter umzubauen.
- Aenderungen: Frameworkfreien `v1`-DTO-Vertrag fuer kuratierte und
  Community-Challenges eingefuehrt; Listen- und Detailendpunkt unter
  `/api/v1/challenges` sowie `/api/v1/challenges/[slug]` angelegt; kanonische
  Web-URLs, deterministische Slug-Deduplizierung mit Vorrang fuer kuratierte
  Inhalte, strukturierte 404-Antwort, kurze Shared-Cache-Regeln und
  `X-Robots-Tag: noindex` ergaenzt. API-Mapper und Vertrag mit zwei Tests
  abgesichert.
- Verifikation: `npm test` mit 13/13 bestandenen Tests; `npm run lint` ohne
  Fehler (zwoelf Warnungen ausschliesslich aus vier vorhandenen
  `.next-locked-*`-Buildartefakten); `npm run build` erfolgreich und beide
  dynamischen API-Routen im Route-Manifest. Lokaler Produktions-Smoke-Test:
  Detail liefert HTTP 200, `apiVersion: v1`, kanonische Challenge-URL und
  `X-Robots-Tag: noindex`; unbekannter Slug liefert HTTP 404 mit
  `challenge_not_found`. Die oeffentliche Detailseite rendert weiterhin H1,
  Canonical und JSON-LD serverseitig.
- Offene Risiken: Der Vertrag ist bewusst nur lesend und hat noch keine
  Pagination; fuer den aktuellen kleinen Katalog ist das ausreichend, vor
  groesserem Datenvolumen sollte eine additive Cursor-Pagination folgen.
  SQLite/`node:sqlite` bleibt experimentell.
- Naechster Schritt: Als kleine Folgeslice den ersten Account-/Teilnahme-
  Lesezugriff hinter eine fachliche Repository-Schnittstelle verschieben; die
  API nur bei einem konkreten Mobile-/Web-Bedarf additiv erweitern.

## 2026-07-13 - Lokalen Preview-Server auf Port 3025 repariert

- Ziel: Nicht reagierenden Login- und Teilnahme-Button der lokalen
  Produktionsvorschau auf Port 3025 untersuchen und wieder funktionsfaehig
  bereitstellen.
- Ursache: Ein vom Entwicklungs-Loop gestarteter `next start`-Prozess blieb ueber
  weitere Build-Laeufe hinweg aktiv. Dadurch lief Port 3025 gegen wechselnde
  `.next`-Artefakte; die Seite wurde serverseitig ausgeliefert, aber die
  interaktiven Client-Komponenten waren in dieser Vorschau nicht mehr sauber
  hydriert. Beim anschliessenden Dev-Server blockierte Next.js zudem Zugriffe
  ueber `127.0.0.1` als nicht erlaubten Dev-Origin.
- Aenderungen: Alten Listener auf Port 3025 gezielt beendet, `127.0.0.1` ueber
  `allowedDevOrigins` fuer lokale Entwicklung freigegeben, Tests/Lint/Build auf
  dem aktuellen Projektstand ausgefuehrt und eine frische Produktionsvorschau
  aus genau diesem Build auf Port 3025 gestartet. Cronjob-Regeln verschaerft: temporaere
  Smoke-Server muessen im selben Lauf beendet werden; keine Builds unter einem
  laufenden `next start` und keine neuen `.next-locked-*`-Archive.
- Verifikation: `npm test` mit 15/15 Tests bestanden; ESLint ohne Fehler
  (Warnungen nur aus alten Buildartefakten); `npm run build` erfolgreich;
  Browser-Smoke auf `http://127.0.0.1:3025/challenges/10000-schritte-am-tag`
  bestaetigt, dass Header-Login und `Jetzt teilnehmen` jeweils den korrekten
  Login-Dialog oeffnen.
- Offene Risiken: Vorhandene `.next-locked-*`-Altartefakte verursachen weiterhin
  Lint-Warnungen und sollten kontrolliert entfernt werden. Die Preview ist ein
  lokaler Entwicklungsprozess, kein dauerhafter Dienst.
- Naechster Schritt: Account-/Teilnahme-Lesezugriff hinter die geplante
  Repository-Grenze verschieben.

## 2026-07-13 - Repository-Grenze fuer Teilnahme-Lesezugriffe

- Ziel: Den ersten nutzerspezifischen Teilnahme-Leseweg aus dem gewachsenen
  SQLite-Modul loesen, ohne Check-in-Schreiblogik, URLs oder SEO-Ausgabe zu
  veraendern.
- Aenderungen: Frameworkfreies Teilnahme-Domainmodell samt
  `ParticipationReadRepository` angelegt; nutzergebundene Listen-, Detail- und
  Check-in-Abfragen in einen `SqliteParticipationReadRepository` verschoben;
  Dashboard und Challenge-Raum ueber eine schmale Anwendungsschnittstelle
  angebunden; alte Leseabfragen und den UI-Datenbanktyp aus `lib/db.ts` entfernt.
- Verifikation: `npm test` mit 15/15 bestandenen Tests, darunter zwei neue
  Adaptertests fuer Nutzerdatentrennung und chronologische Check-ins;
  `npm run lint` ohne Fehler (15 Warnungen ausschliesslich aus fuenf alten
  `.next-locked-*`-Artefakten); `npm run build` erfolgreich. Lokaler
  Produktions-Smoke auf Port 3031 bestaetigte serverseitiges H1, Title,
  Canonical, JSON-LD, Sitemap-Eintrag und den 307-Login-Redirect des privaten
  Dashboards; der temporaere Server und vier vor dem Build gefundene alte
  Projekt-Previews wurden beendet.
- Offene Risiken: Ranking-, Teilnehmerzaehler und alle Schreibzugriffe liegen
  weiterhin in `lib/db.ts`; SQLite/`node:sqlite` bleibt experimentell. Alte
  `.next-locked-*`-Artefakte verursachen weiter Lint-Warnungen und wurden in
  dieser Slice nicht angefasst.
- Naechster Schritt: Als naechste kleine Slice die oeffentlichen Teilnahmezaehler
  und das Ranking hinter eine eigene fachliche Read-Repository-Grenze
  verschieben; Schreibzugriffe danach separat behandeln.

## 2026-07-13 - Challenge-Titel und Unterlaenge korrigiert

- Ziel: Die H1 der ersten Challenge exakt als `10 000 Schritte am Tag Challenge`
  ausgeben und das unten abgeschnittene `g` sichtbar machen.
- Aenderungen: Kuratierten Titel und Startseiten-Auszug aktualisiert; in der
  Detailseiten-H1 den zu engen Zeilenabstand von `0.96` auf `1.02` vergroessert.
  Der erste Padding-Fix reichte im Nutzer-Browser nicht; deshalb wurden der
  abschneidende `overflow: hidden` und der WebKit-Line-Clamp vollstaendig entfernt.
- Verifikation: 15/15 Tests bestanden; ESLint ohne Fehler (bekannte Warnungen
  nur aus alten `.next-locked-*`-Artefakten); lokaler Browser-Smoke bestaetigt
  den exakten H1-/SEO-Titel, sichtbare Unterlaengen und weiterhin funktionierenden
  Login-Dialog.
- Offene Risiken: Kein produktiver Deploy; alte Buildartefakte bleiben separat
  aufzuraeumen.

## 2026-07-13 - Registrierung in den Login-Dialog integriert

- Ziel: Registrierung ohne Seitenwechsel direkt im Login-Popup anbieten und die
  alte kombinierte Auth-Seite entfernen.
- Aenderungen: Login-Dialog um einen lokalen Login-/Registrierungsmodus erweitert;
  Registrierung fragt Benutzername, E-Mail und Passwort ab und nutzt die
  bestehende serverseitige `registerAction`. Tote Passwort-vergessen-Verlinkung
  entfernt; Wechsel zur Anmeldung bleibt im selben Dialog. `/auth` zeigt keine
  eigene Seite mehr, sondern leitet zur Startseite; ungenutzte Auth-Formulare und
  Styles entfernt. Auch der Login-Hinweis beim Challenge-Erstellen nutzt nun das
  Popup; den veralteten Konto-Link aus dem Profilmenue entfernt. Der
  `Jetzt teilnehmen`-CTA nutzt ebenfalls ohne abweichenden Kicker oder Sondertext
  exakt denselben Login-/Registrierungsdialog wie der Header.
- Verifikation: Zwei neue Playwright-Tests zuerst fehlschlagen und nach der
  Umsetzung bestehen gesehen; 15/15 Domain-/Adaptertests bestanden; ESLint ohne
  Fehler (bekannte Warnungen nur aus `.next-locked-*`); Produktions-Build und
  anschliessender E2E-Lauf mit 3/3 Tests erfolgreich. Browser-Smoke bestaetigt
  alle drei Registrierungsfelder und den Rueckwechsel zur Anmeldung.
- Offene Risiken: Passwort-Reset ist weiterhin nicht implementiert und wird
  deshalb nicht mehr als funktionsloser Link angeboten. Kein produktiver Deploy.

## 2026-07-22 - Lastenheft v1.0 gegen Strategie und Code abgeglichen

- Ziel: Das neue fachliche Lastenheft mit dem bestehenden Lastenheft v0.1 und
  dem aktuellen Next.js-Stand vergleichen.
- Aenderungen: `LASTENHEFT-ABGLEICH.md` mit Gemeinsamkeiten, Widerspruechen,
  Ist-/Gap-Matrix, konkreten Produktentscheidungen und zehn empfohlenen Slices
  angelegt. Das neue Dokument wird als langfristiges Zielbild empfohlen; die
  enge MVP-/Release-Strategie aus v0.1 soll separat erhalten bleiben.
- Verifikation: Beide Lastenhefte vollstaendig gelesen, App-Routen, API-Routen,
  Auth-/Account-Repository, Ranking, PostgreSQL-Ausgangsmigration und `TODOS.md`
  gegen die Anforderungen geprueft; `git diff --check` fuer den neuen Bericht
  erfolgreich.
- Offene Risiken: Noch keine fachliche Freigabe fuer die Ersetzung des alten
  Lastenhefts. Besonders offen sind Positionierung, MVP-Grenze,
  Challenge-Titelkonvention und Umfang der Verifizierung.

## 2026-07-22 - Eindeutige Benutzernamen und Identifier-Login

- Ziel: Die erste konkrete Auth-Luecke aus dem Lastenheft schliessen und den
  vorhandenen Popup-Flow beibehalten.
- Aenderungen: Account-Repository um case-insensitive Suche per E-Mail oder
  Benutzername erweitert; Registrierung verhindert doppelte Benutzernamen
  atomar. Bestehende SQLite-Namen werden sicher getrimmt und bei Altdubletten
  deterministisch ergaenzt; PostgreSQL-Folgemigration
  `0004_unique_usernames.sql` angelegt. Login-Popup fragt nun
  `E-Mail-Adresse oder Benutzername` ab. E2E-Testkonten verwenden eindeutige
  Benutzernamen, damit die Suite wiederholbar bleibt.
- TDD: Repository-Suche, Username-Konflikt und beide Datenbankmigrationen zuerst
  mit fehlschlagenden Tests spezifiziert; danach minimal implementiert.
- Verifikation: 47/47 Unit-/Repository-/Migrationstests bestanden; ESLint ohne
  Fehler (15 bekannte Warnungen nur aus alten `.next-locked-*`-Artefakten);
  Produktions-Build mit 22 Seiten erfolgreich; 9/9 Playwright-E2E-Tests auf der
  frischen Produktionsvorschau bestanden, einschliesslich Registrierung,
  Logout und erneutem Login per Benutzername.
- Hinweis: Ein verbliebener Next-Dev-Prozess hielt einmal ein `.next`-Verzeichnis
  offen. Nach gezieltem Beenden und Entfernen der drei gesperrten generierten
  Manifestdateien lief der Build erfolgreich. Kein Deployment und kein Push.

## 2026-07-22 - Teilnahme nach Auth automatisch fortgesetzt

- Ziel: Den zentralen Gast-Flow ohne zweiten Klick abschliessen: Challenge
  waehlen, anmelden oder registrieren, Teilnahme speichern und bestaetigen.
- Aenderungen: `ChallengeStart` uebergibt den Teilnahme-Intent an das gemeinsame
  Auth-Popup. Login und Registrierung starten die veroeffentlichte Challenge nach
  erfolgreicher Session-Erstellung idempotent und leiten auf die neue geschuetzte
  Route `/challenges/[slug]/teilnahme-bestaetigt` weiter. Die Seite prueft Nutzer,
  Teilnahme-ID und Challenge-Slug serverseitig und bietet Links zum Dashboard,
  zur Challenge und zur Challenge-Partner-Suche. Bereits eingeloggte Nutzer
  erhalten dieselbe Bestaetigung. Der kuratierte Challenge-Titel wird bevorzugt,
  damit alte lokale Daten keinen veralteten Titel anzeigen.
- TDD/E2E: Der neue Gast-Flow wurde zuerst als fehlschlagender Playwright-Test
  festgelegt. Einladungstests wurden an die neue Bestaetigungsstation angepasst;
  ihre Ranking-Pruefung bleibt auch bei gefuellten lokalen Top-10-Testdaten stabil.
- Visuelle Pruefung: Desktop-Bestaetigungsseite ohne abgeschnittene Inhalte,
  mit vollstaendiger Headline und drei klaren Aktionen geprueft.
- Kein Deployment, kein Push und keine produktiven Aenderungen.

## 2026-07-22 - Teilnahme fuer alle veroeffentlichten Challenges

- Ziel: Die bisherige technische Begrenzung auf die erste kuratierte
  10.000-Schritte-Challenge entfernen.
- Aenderungen: Die Anwendung loest den Teilnahme-Start nun asynchron entweder
  gegen eine kuratierte Challenge oder gegen eine bereits veroeffentlichte
  Community-Challenge auf. Die Server Action besitzt keine feste Slug-Ausnahme
  mehr; kuratierte und datenbankgestuetzte Detailseiten zeigen den echten
  `Jetzt teilnehmen`-CTA. Nicht veroeffentlichte oder unbekannte Challenges
  bleiben durch Repository-Statuspruefung gesperrt.
- TDD/E2E: Der vorhandene Challenge-Erstellungstest wurde zuerst um den noch
  fehlschlagenden Ablauf Veroeffentlichen -> Teilnehmen -> Bestaetigung ->
  Dashboard erweitert. Danach wurde die minimale Generalisierung umgesetzt.
- Verifikation: 48/48 Unit-/Repositorytests, ESLint ohne Fehler (15 bekannte
  Warnungen aus `.next-locked-*`) und 10/10 Playwright-E2E-Tests bestanden;
  Produktions-Build erfolgreich.
- Kein Deployment und kein Push.

## 2026-07-13 - Repository-Grenze fuer Teilnahmezaehler und Ranking

- Ziel: Oeffentliche Teilnahmezaehler und Ranking-Lesezugriffe als kleine
  Architektur-Slice aus `lib/db.ts` loesen, ohne sichtbares Verhalten, URLs oder
  serverseitige SEO-Ausgabe zu veraendern.
- Aenderungen: Fachliches `ChallengeParticipationStatsRepository` mit
  Ranking-Kandidatenmodell angelegt; Zaehler- und Ranking-SQL in den getesteten
  `SqliteChallengeParticipationStatsRepository` verschoben; Anwendungsschicht
  fuer Startseite, Katalog, Challenge-Detail und persoenlichen Challenge-Raum
  eingefuehrt; reine Fortschritts-/Sortierlogik bleibt getrennt; Todo erledigt.
- Verifikation: `npm test` mit 17/17 bestandenen Tests, darunter zwei neue
  Adaptertests fuer aggregierte Zaehler, leere Challenges, aktive Teilnahmen und
  chronologische Check-ins; `npm run lint` ohne Fehler (15 bekannte Warnungen nur
  aus alten `.next-locked-*`-Artefakten); `npm run build` erfolgreich. Temporaerer
  Production-Smoke auf Port 3043 lieferte HTTP 200 fuer Challenge, Sitemap und
  Robots; exakter Title, Canonical, H1, JSON-LD, Ranking-Marker sowie kanonische
  Sitemap-/Robots-Marker wurden geprueft. Server beendet und Port freigegeben.
- Offene Risiken: SQLite/`node:sqlite` bleibt experimentell; Zaehler umfassen wie
  bisher alle Teilnahme-Status, waehrend das Ranking nur aktive Teilnahmen nutzt.
  Alte `.next-locked-*`-Artefakte verursachen weiterhin Lint-Warnungen.
- Naechster Schritt: Einen einzelnen Schreibzugriff, vorzugsweise den Check-in,
  hinter eine fachliche Repository-Schnittstelle verschieben und mit
  Berechtigungs-/Idempotenztests absichern.

## 2026-07-13 - Repository-Grenze fuer Check-in-Schreibzugriff

- Ziel: Den taeglichen Check-in als ersten Schreibzugriff aus `lib/db.ts` loesen
  und Eigentumspruefung sowie Idempotenz direkt am Persistenzadapter absichern.
- Aenderungen: Fachliches `CheckInWriteRepository` mit expliziten Ergebnissen
  angelegt; atomaren SQLite-Adapter mit nutzergebundenem `INSERT ... SELECT`
  umgesetzt; Server Action ueber eine schmale Anwendungsschnittstelle angebunden;
  alten Check-in-SQL-Zugriff aus `lib/db.ts` entfernt; Architektur-Todo erledigt.
- Verifikation: `npm test` mit 19/19 bestandenen Tests, darunter zwei neue Tests
  fuer fremde/nicht vorhandene Teilnahmen und wiederholte Tages-Check-ins;
  `npm run lint` ohne Fehler (15 bekannte Warnungen nur aus alten
  `.next-locked-*`-Artefakten); `npm run build` erfolgreich. Temporaerer
  Production-Smoke auf Port 3047 bestaetigte HTTP 200, serverseitiges H1,
  Canonical, JSON-LD sowie kanonische Robots-/Sitemap-Marker; Server beendet und
  Port anschliessend als frei verifiziert. `git diff --check` erfolgreich.
- Offene Risiken: SQLite/`node:sqlite` bleibt experimentell. Das Repository
  validiert bewusst Eigentum und Eindeutigkeit, waehrend das Tagesdatum weiterhin
  serverseitig in der Action fuer `Europe/Berlin` erzeugt wird. Alte
  `.next-locked-*`-Artefakte bleiben unveraendert.
- Naechster Schritt: Als naechste kleine Architektur-Slice den Start einer
  Teilnahme hinter eine fachliche Write-Repository-Grenze verschieben und
  Duplikat-/Challenge-Berechtigungsregeln testen.

## 2026-07-14 - Repository-Grenze fuer Teilnahme-Start

- Ziel: Den Start einer Teilnahme aus `lib/db.ts` loesen und Challenge-Freigabe
  sowie wiederholte Startversuche am Persistenzadapter absichern.
- Aenderungen: Fachliches `ParticipationWriteRepository` mit expliziten
  Ergebnissen angelegt; atomaren SQLite-Adapter eingefuehrt, der nur vorhandene
  Nutzer und veroeffentlichte Challenges akzeptiert; wiederholte Starts liefern
  stabil die bestehende Teilnahme; Server Action ueber eine schmale
  Anwendungsschnittstelle angebunden und alten Teilnahme-SQL-Zugriff aus
  `lib/db.ts` entfernt; Todo abgeschlossen.
- Verifikation: `npm test` mit 21/21 bestandenen Tests, darunter zwei neue Tests
  fuer erfolgreichen/duplizierten Start sowie Draft-, unbekannte Challenge- und
  unbekannte Nutzerfaelle; `npm run lint` ohne Fehler (15 bekannte Warnungen nur
  aus alten `.next-locked-*`-Artefakten); `npm run build` erfolgreich.
  Temporaerer Production-Smoke auf Port 3052 bestaetigte HTTP-Auslieferung,
  serverseitiges H1, Canonical, JSON-LD sowie kanonische Robots-/Sitemap-Marker;
  Server beendet und Port anschliessend als frei verifiziert. Vor dem Build
  wurden drei alte Projekt-Previews auf den Ports 3025, 3043 und 3047 beendet.
- Offene Risiken: SQLite/`node:sqlite` bleibt experimentell. Das initiale
  Materialisieren kuratierter Challenges liegt weiterhin in `lib/db.ts`; die
  Server Action beschraenkt den MVP weiterhin bewusst auf die erste
  10.000-Schritte-Challenge. Alte `.next-locked-*`-Artefakte bleiben
  unveraendert.
- Naechster Schritt: Als naechste kleine Architektur-Slice die oeffentliche
  Challenge-Erstellung hinter eine fachliche Write-Repository-Grenze verschieben
  und Slug-/Freigaberegeln testen.

## 2026-07-14 - Repository-Grenze fuer oeffentliche Challenge-Erstellung

- Ziel: Die oeffentliche Challenge-Erstellung aus `lib/db.ts` loesen und Slug-,
  Ersteller- sowie Veroeffentlichungsregeln am Persistenzadapter absichern.
- Aenderungen: Fachliches `ChallengeWriteRepository` und getesteten SQLite-Adapter
  eingefuehrt; Anwendungsschicht erzeugt eindeutige sprechende Slugs unter
  Beruecksichtigung kuratierter und gespeicherter Challenges; Server Action auf
  die neue Grenze umgestellt und alten Challenge-Schreibzugriff aus `lib/db.ts`
  entfernt. Community-Detailseiten liefern jetzt eigene Canonical-/Social-
  Metadaten und `Article`-/`HowTo`-JSON-LD; unbekannte Fallback-Seiten sind
  `noindex`. Todo abgeschlossen.
- Verifikation: `npm test` mit 23/23 bestandenen Tests, darunter zwei neue
  Adaptertests fuer `public`/`published`, stabile Slugs, Kollisionen und unbekannte
  Ersteller; `npm run lint` ohne Fehler (15 bekannte Warnungen nur aus alten
  `.next-locked-*`-Artefakten); `npm run build` erfolgreich. Isolierter
  Production-E2E-Smoke auf Port 3025 registrierte einen Nutzer, erstellte eine
  Challenge und bestaetigte H1, sprechende URL, Canonical, JSON-LD sowie den
  Sitemap-Eintrag. Temporaere DB und Server wurden entfernt; Port 3025 ist frei.
- Offene Risiken: SQLite/`node:sqlite` bleibt experimentell. Bei einer seltenen
  Slug-Kollision zwischen Slug-Ermittlung und Insert erhaelt der Nutzer eine
  erneute Eingabeaufforderung statt eines automatischen Retries. Alte
  `.next-locked-*`-Artefakte bleiben unveraendert.
- Naechster Schritt: Als naechste kleine Architektur-Slice Account- und
  Session-Schreibzugriffe hinter eine fachliche Repository-Grenze verschieben.

## 2026-07-14 - Repository-Grenze fuer Accounts und Sessions

- Ziel: Account- und Session-Persistenz aus `lib/db.ts` loesen und konkurrierende
  Registrierungen sowie ungueltige oder doppelte Sessions am Adapter absichern.
- Aenderungen: Fachliches `AccountSessionRepository` und getesteten SQLite-Adapter
  eingefuehrt; E-Mail-Normalisierung, atomare Account-Erstellung, zeitgebundene
  Session-Aufloesung, Session-Erstellung nur fuer vorhandene Accounts sowie
  idempotenten Logout umgesetzt; Auth-Anwendungsschicht und Server Actions auf
  die neue Grenze umgestellt; alte Account-/Session-SQL-Zugriffe aus `lib/db.ts`
  entfernt; Todo abgeschlossen.
- Verifikation: `npm test` mit 26/26 bestandenen Tests, darunter drei neue Tests
  fuer normalisierte/doppelte Accounts, unbekannte Nutzer, abgelaufene Sessions,
  Token-Konflikte und idempotenten Logout; `npm run lint` ohne Fehler (15 bekannte
  Warnungen nur aus alten `.next-locked-*`-Artefakten); `npm run build`
  erfolgreich. Isolierter Production-E2E-Smoke auf Port 3025 mit temporaerer DB:
  4/4 Playwright-Tests fuer Login-/Registrierungsdialog, Registrierung und
  crawlbare Challenge-Erstellung bestanden; Canonical und Sitemap-Marker der
  10.000-Schritte-Seite geprueft. Temporaere DB und Server entfernt, Port 3025
  anschliessend als frei verifiziert; `git diff --check` erfolgreich.
- Offene Risiken: SQLite/`node:sqlite` bleibt experimentell. Account- und
  Session-Repository sind aktuell gemeinsam geschnitten; bei wachsendem
  Account-Funktionsumfang kann die Grenze spaeter ohne UI-Vertragsaenderung
  fachlich geteilt werden. Alte `.next-locked-*`-Artefakte bleiben unveraendert.
- Naechster Schritt: Das Materialisieren kuratierter Challenges und des
  Systemnutzers aus `lib/db.ts` hinter eine schmale Bootstrap-/Repository-Grenze
  verschieben oder als naechste Produktslice sichere Einladungstokens beginnen.

## 2026-07-15 - Bootstrap-Grenze fuer kuratierte Challenges

- Ziel: Die letzte fachliche Sonderlogik aus `lib/db.ts` loesen, indem das fuer
  Teilnahme-Starts notwendige Materialisieren kuratierter Challenges und des
  internen Systemnutzers hinter eine schmale Repository-Grenze wandert.
- Aenderungen: Frameworkfreies `CuratedChallengeBootstrapRepository` und
  SQLite-Adapter eingefuehrt; Systemnutzer und interne kuratierte Challenge
  werden idempotent angelegt, bestehende Slugs bleiben unveraendert erhalten;
  Teilnahme-Anwendungsschicht auf den neuen Bootstrap-Service umgestellt und
  `lib/db.ts` auf Verbindungsaufbau sowie Schema-Initialisierung reduziert; Todo
  abgeschlossen.
- Verifikation: `npm test` mit 28/28 bestandenen Tests, darunter zwei neue
  Bootstrap-Adaptertests; `npm run lint` ohne Fehler (15 bekannte Warnungen nur
  aus alten `.next-locked-*`-Artefakten); `npm run build` erfolgreich.
  Temporaerer Production-Smoke auf Port 3057 bestaetigte HTTP 200,
  serverseitiges H1, Canonical, JSON-LD sowie kanonische Sitemap-/Robots-Marker;
  Server beendet und Port anschliessend als frei verifiziert; `git diff --check`
  erfolgreich.
- Offene Risiken: SQLite/`node:sqlite` bleibt experimentell. Bei einer extrem
  seltenen ID-Kollision mit abweichendem Slug bricht die Materialisierung
  kontrolliert ab; die stabilen kuratierten IDs machen diesen Fall im aktuellen
  Datenmodell nicht erwartbar. Alte `.next-locked-*`-Artefakte bleiben
  unveraendert.
- Naechster Schritt: Als kleine Produktslice den Datenvertrag und die
  Persistenzgrenze fuer sichere, zeitlich begrenzte Freund-Einladungstokens
  anlegen; UI und Annahme-Flow danach separat umsetzen.

## 2026-07-15 - Persistenzgrenze fuer Freund-Einladungen

- Ziel: Als erste klar begrenzte Freund-herausfordern-Slice den Datenvertrag und
  die Persistenz fuer sichere, zeitlich begrenzte Einladungstokens schaffen,
  ohne bereits UI, Link-Erzeugung oder Annahme-Flow zu vermischen.
- Aenderungen: Frameworkfreies `ChallengeInvitationRepository` und SQLite-Adapter
  fuer Erstellung sowie Aufloesung aktiver Einladungen angelegt; nur aktive
  Teilnahmen duerfen einladen, in der Datenbank wird ausschliesslich ein
  eindeutiger Token-Hash gespeichert, abgelaufene, angenommene und widerrufene
  Einladungen werden nicht aufgeloest. SQLite-Runtime-Schema und versionierte
  PostgreSQL-Migration `0002_challenge_invitations.sql` samt Indizes,
  Ablauf-/Annahmezustand und Dokumentation ergaenzt; Todo-Teilschritt erledigt.
- Verifikation: `npm test` mit 32/32 bestandenen Tests, darunter drei neue
  Adaptertests und ein neuer Migrationstest; `npm run lint` ohne Fehler (15
  bekannte Warnungen nur aus alten `.next-locked-*`-Artefakten); `npm run build`
  nach Beenden alter Projekt-Previews erfolgreich. Temporaerer Production-Smoke
  auf Port 3062 bestaetigte HTTP 200, serverseitiges H1, Canonical, JSON-LD sowie
  kanonische Robots-/Sitemap-Marker; Server beendet und Port als frei verifiziert.
- Offene Risiken: PostgreSQL-Migration mangels freigegebener Instanz nicht real
  angewendet; SQLite/`node:sqlite` bleibt experimentell. Sichere Roh-Token-
  Erzeugung, Erstellungsaktion, teilbarer Link und Annahme sind bewusst noch
  nicht angebunden. Fuenf alte `.next-locked-*`-Artefakte bleiben unveraendert.
- Naechster Schritt: Kryptografisch sicheren Roh-Token einmalig erzeugen, nur
  dessen Hash persistieren und die eingeloggte Erstellungsaktion im persoenlichen
  Challenge-Raum mit einem teilbaren Link anbinden; Annahme danach separat.

## 2026-07-15 - Sicherer Einladungslink im Challenge-Raum

- Ziel: Eingeloggten Teilnehmern einen zeitlich begrenzten Freund-Einladungslink
  bereitstellen, ohne den Annahme-Flow in dieselbe Slice zu ziehen.
- Aenderungen: Kryptografisch zufaellige 256-Bit-Roh-Tokens mit SHA-256-Hashing,
  sieben Tagen Laufzeit und begrenztem Kollisions-Retry eingefuehrt; Repository-
  Erstellung zusaetzlich atomar an den Eigentuemer der aktiven Teilnahme
  gebunden; Server Action und UI im persoenlichen Challenge-Raum ergaenzt. Der
  Roh-Token wird nur einmal an den Browser zurueckgegeben, der teilbare Link kann
  kopiert werden, waehrend die Datenbank ausschliesslich den Hash speichert.
- Verifikation: `npm test` mit 34/34 bestandenen Tests; `npm run lint` ohne Fehler
  (15 bekannte Warnungen nur aus alten `.next-locked-*`-Artefakten);
  `npm run build` erfolgreich. Isolierter Production-E2E-Smoke auf Port 3071
  registrierte einen Nutzer, startete die Challenge und erstellte einen Link mit
  43-stelligem Base64url-Token; Kopieraktion funktionierte. SEO-Smoke mit
  Einladungs-Query bestaetigte weiterhin kanonische URL ohne Query, H1 und
  JSON-LD. Temporaerer Server beendet und Port als frei verifiziert.
- Offene Risiken: Der Link fuehrt derzeit auf die oeffentliche Challenge-Seite;
  Annahme nach Login/Registrierung, Selbstannahmeschutz und gemeinsames Ranking
  folgen bewusst separat. SQLite/`node:sqlite` bleibt experimentell; alte
  `.next-locked-*`-Artefakte bleiben unveraendert.
- Naechster Schritt: Einladungsannahme als eigene atomare Repository-/Action-
  Slice umsetzen und danach das gemeinsame Ranking aus echten Teilnahmen zeigen.

## 2026-07-16 - Einladungsannahme und gemeinsames Ranking

- Ziel: Den Freund-herausfordern-Flow mit sicherer Annahme nach Login oder
  Registrierung, Selbstannahmeschutz und gemeinsamem echten Ranking schliessen.
- Aenderungen: Challenge-Seite erkennt aktive Einladungs-Hashes und zeigt einen
  serverseitig eingebetteten Annahmehinweis; Login/Registrierung bewahren den
  Einladungslink. Der SQLite-Adapter nimmt die Einladung in einer
  `BEGIN IMMEDIATE`-Transaktion an, erstellt oder reaktiviert die Teilnahme an
  derselben Challenge und markiert den Token einmalig als angenommen; eigene,
  abgelaufene, widerrufene oder bereits verwendete Einladungen werden
  abgelehnt. Nach Annahme fuehrt der Flow in den Challenge-Raum, dessen echtes
  Ranking Einlader und eingeladenen Teilnehmer gemeinsam zeigt. Canonical und
  strukturierte Daten der oeffentlichen Challenge bleiben ohne Token-Query.
- Verifikation: `npm test` mit 38/38 bestandenen Tests; `npm run lint` ohne
  Fehler (15 bekannte Warnungen ausschliesslich aus alten `.next-locked-*`-
  Artefakten); `npm run build` nach einmaliger sicherer `.next`-Bereinigung ohne
  laufende Preview erfolgreich. Isolierter Production-E2E-Smoke auf Port 3077
  mit temporaerer DB: 2/2 Playwright-Tests bestanden, darunter Registrierung
  beider Nutzer, Linkerstellung, Annahme, Redirect in den Challenge-Raum,
  gemeinsames Ranking sowie Title, Canonical und `Article`-/`HowTo`-JSON-LD
  ohne Query. Serverprozess und Kindprozess beendet, Port als frei verifiziert
  und temporaere DB entfernt.
- Offene Risiken: SQLite/`node:sqlite` bleibt experimentell; PostgreSQL-
  Migrationen wurden weiterhin nicht gegen eine freigegebene Instanz angewendet.
  Alte `.next-locked-*`-Artefakte bleiben unveraendert. Ein bereits bestehender
  beendeter Challenge-Eintrag wird bei Annahme bewusst reaktiviert und behaelt
  sein urspruengliches Startdatum.
- Naechster Schritt: Als kleine Architektur-Slice einen PostgreSQL-Adapter fuer
  einen klar begrenzten Repository-Leseweg vorbereiten oder zuerst die fachliche
  Duplikatpruefung fuer die Challenge-Erstellung ausarbeiten.

## 2026-07-16 - PostgreSQL-Challenge-Level an Domainmodell angeglichen

- Ziel: Eine beim Architektur-Review gefundene Schemaabweichung beheben, durch
  die PostgreSQL keine der aktuellen Domainstufen `User`, `Advanced` oder
  `Premium` akzeptiert haette.
- Aenderungen: Versionierte Folgemigration `0003_align_challenge_levels.sql`
  angelegt; alte Zielwerte `Fortgeschritten`/`Experte` werden kontrolliert
  ueberfuehrt und die Constraint auf exakt `User`, `Beginner`, `Advanced` und
  `Premium` gesetzt. Migrationsreihenfolge, Strukturtest, README und Todo wurden
  aktualisiert; die laufende SQLite-Runtime blieb unveraendert.
- Verifikation: `npm test` mit 39/39 bestandenen Tests; `npm run lint` ohne Fehler
  (15 bekannte Warnungen ausschliesslich aus alten `.next-locked-*`-Artefakten);
  `npm run build` erfolgreich. Temporaerer Production-Smoke auf Port 3083
  bestaetigte HTTP 200, exakten SEO-Titel, Canonical, H1, `Article`-/`HowTo`-
  JSON-LD sowie kanonische Sitemap-/Robots-Marker. Server beendet, Port frei und
  kein Next-Previewprozess aktiv; `git diff --check` erfolgreich.
- Offene Risiken: Die Migration wurde mangels freigegebener PostgreSQL-Instanz
  nicht gegen einen echten Server angewendet. SQLite/`node:sqlite` bleibt die
  experimentelle Runtime; alte `.next-locked-*`-Artefakte bleiben unveraendert.
- Naechster Schritt: Einen PostgreSQL-Adapter fuer den oeffentlichen
  Challenge-Leseweg mit asynchroner Repository-Grenze vorbereiten, ohne die
  Runtime bereits umzuschalten.

## 2026-07-16 - PostgreSQL-Adapter fuer oeffentliche Challenge-Lesewege

- Ziel: Den ersten konkreten PostgreSQL-Datenadapter hinter der bestehenden
  Domain-/Repository-Grenze vorbereiten, ohne Datenbank, Runtime oder SEO-faehige
  Webausgabe bereits umzuschalten.
- Aenderungen: `PublicChallengeRepository` auf einen asynchronen Vertrag
  umgestellt und alle Web-, Sitemap- sowie v1-API-Aufrufer entsprechend
  angepasst; PostgreSQL-Adapter mit parametrisiertem Slug-Lookup, Public-/
  Published-Filter, JSONB- und Zeitstempel-Mapping ergaenzt; SQLite bleibt der
  aktive Runtime-Adapter. Zwei Adaptertests sichern SQL-Vertrag, Mapping und
  Leerzustand ab; Todo abgeschlossen.
- Verifikation: `npm test` mit 41/41 bestandenen Tests; `npm run lint` ohne Fehler
  (15 bekannte Warnungen ausschliesslich aus alten `.next-locked-*`-Artefakten);
  `npm run build` erfolgreich. Temporaerer Production-Smoke auf Port 3089
  bestaetigte HTTP 200, exakten SEO-Titel, Canonical, H1, `Article`-/`HowTo`-
  JSON-LD, kanonische Sitemap-/Robots-Marker sowie v1-API-Canonical und
  `X-Robots-Tag: noindex`. Server samt verbliebenem Kindprozess beendet und Port
  anschliessend als frei verifiziert; `git diff --check` erfolgreich.
- Offene Risiken: Der Adapter wurde mangels freigegebener PostgreSQL-Instanz mit
  einem Query-Client-Testdouble statt gegen einen echten Server ausgefuehrt; ein
  PostgreSQL-Treiber und die Runtime-Auswahl sind bewusst noch nicht angebunden.
  SQLite/`node:sqlite` bleibt experimentell; alte `.next-locked-*`-Artefakte
  bleiben unveraendert.
- Naechster Schritt: Challenge-Erstellung fachlich um eine serverseitige
  Duplikatpruefung gegen Titel, Slug und aehnliche bestehende Challenges
  erweitern, bevor der Erstellungsflow weiter ausgebaut wird.

## 2026-07-22 - Duplikatpruefung fuer Challenge-Erstellung

- Ziel: Doppelte oder sehr aehnliche oeffentliche Challenges vor dem Schreiben
  erkennen und Nutzer auf die bereits vorhandene, crawlbare Detailseite fuehren.
- Aenderungen: Frameworkfreie Normalisierung und Aehnlichkeitspruefung fuer Titel
  und Slugs eingefuehrt; kuratierte sowie veroeffentlichte SQLite-Challenges in
  den Abgleich aufgenommen; Write-Repository um den gefilterten Kandidaten-Leseweg
  ergaenzt. Der Erstellungsflow stoppt bei bis zu drei Treffern und zeigt
  interne Links auf bestehende Challenges statt einen weiteren Slug anzulegen.
- Verifikation: `npm test` mit 43/43 bestandenen Tests; `npm run lint` ohne Fehler
  (15 bekannte Warnungen ausschliesslich aus alten `.next-locked-*`-Artefakten);
  `npm run build` erfolgreich. Isolierter Production-E2E-Smoke auf Port 3097 mit
  temporaerer SQLite-DB: 2/2 Playwright-Tests fuer crawlbare Neuerstellung und
  blockiertes Duplikat bestanden. SEO-Smoke bestaetigte Title, Canonical und
  JSON-LD der bestehenden 10.000-Schritte-Seite. Server beendet, Port frei und
  temporaere DB entfernt; `git diff --check` erfolgreich.
- Offene Risiken: Die bewusst einfache Wortueberdeckung kann bei sehr kurzen oder
  synonym formulierten Titeln Treffer uebersehen bzw. aehnliche, aber fachlich
  unterschiedliche Ideen blockieren. SQLite/`node:sqlite` bleibt experimentell;
  der erste Wiederholungs-Build traf einen transienten `.next`-EPERM-Lock und war
  nach sicherer Bereinigung ohne laufenden Previewprozess erfolgreich.
- Naechster Schritt: Als kleine Produktslice den schlanken echten Aktivitaetsfeed
  fuer Challenge-Seiten fachlich schneiden oder den PostgreSQL-Runtime-Umschalter
  erst nach einer freigegebenen Testinstanz vorbereiten.

## 2026-07-22 - Echter Aktivitaetsfeed auf Challenge-Seiten

- Ziel: Challenge-Seiten um einen schlanken, serverseitig gerenderten Feed aus
  realen Check-ins ergaenzen, ohne simulierte Community-Meldungen einzufuehren.
- Aenderungen: Statistik-Domain und SQLite-Adapter um einen auf 20 Eintraege
  begrenzten, nach Erstellzeit sortierten Check-in-Leseweg erweitert; die
  kuratierten Detailseiten zeigen die letzten acht Aktivitaeten mit Nutzername und
  Check-in-Datum oder einen ehrlichen Leerzustand. Bestehende URL, Metadata,
  Canonical und strukturierte Daten blieben unveraendert.
- Verifikation: Neuer Repository-Test zuerst erwartungsgemaess fehlgeschlagen und
  danach bestanden; `npm test` 48/48 bestanden; `npm run lint` ohne Fehler (15
  bekannte Warnungen ausschliesslich aus alten `.next-locked-*`-Artefakten);
  `npm run build` erfolgreich mit 22 Seiten. SSR-Smoke bestaetigte sechs Feed-/
  SEO-Marker. Browser-Smoke mit Edge auf 1366x768 und 390x844 bestaetigte Feed,
  Canonical, JSON-LD und keinen horizontalen Overflow. Temporaerer Server auf
  Port 3109 beendet und Port anschliessend als frei verifiziert.
- Offene Risiken: Der Feed zeigt wie das oeffentliche Ranking den gewaehlten
  Benutzernamen; eine spaetere Privacy-/Profilentscheidung kann hier eine
  Sichtbarkeitseinstellung erfordern. SQLite/`node:sqlite` bleibt experimentell.
- Naechster Schritt: Als kleine Folgeslice die API-Pagination fuer den wachsenden
  Challenge-Katalog spezifizieren oder nach Freigabe eine PostgreSQL-Testinstanz
  fuer reale Migrations-/Adaptertests verwenden.

## 2026-07-23 - Cursor-Pagination fuer oeffentliche Challenge-API

- Ziel: Den wachsenden oeffentlichen `v1`-Challenge-Katalog mit einer kleinen,
  stabilen und fuer Web-/App-Clients validierten Pagination absichern.
- Aenderungen: Listenendpunkt um `limit` (Standard 20, maximal 100) und opaken
  Keyset-Cursor erweitert; Ergebnisse werden deterministisch nach Erstellzeit und
  Slug sortiert. Die Antwort enthaelt `pagination.limit` und `nextCursor`;
  ungueltige Limits oder Cursor liefern HTTP 400 mit `invalid_pagination`.
  Kuratierte Challenges behalten bei Slug-Duplikaten Vorrang.
- Verifikation: `npm test` mit 50/50 bestandenen Tests; `npm run lint` ohne Fehler
  (15 bekannte Warnungen nur aus alten `.next-locked-*`-Artefakten);
  `npm run build` erfolgreich mit 22 Seiten. Production-Smoke auf Port 3117
  bestaetigte zwei ueberlappungsfreie API-Seiten, HTTP 400 fuer `limit=101`,
  `X-Robots-Tag: noindex` sowie weiterhin serverseitigen Title, Canonical, H1 und
  JSON-LD der 10.000-Schritte-Seite. Server beendet und Port als frei verifiziert;
  `git diff --check` erfolgreich.
- Offene Risiken: Der aktive SQLite-Adapter liest fuer die Zusammenfuehrung mit
  kuratierten Eintraegen weiterhin den gesamten kleinen Katalog; bei grossem
  Datenvolumen sollte die Keyset-Grenze in PostgreSQL/Repository-SQL verschoben
  werden. SQLite/`node:sqlite` bleibt experimentell; alte `.next-locked-*`-
  Artefakte blieben entsprechend Vorgabe unangetastet.
- Naechster Schritt: Keyset-Pagination bei aktivierter PostgreSQL-Testinstanz in
  den Repository-Leseweg verschieben oder als naechste Produktslice den privaten
  Challenge-Verlauf/Heatmap im Bereich `Meine Challenges` schneiden.

## 2026-07-23 - Privater 12-Wochen-Challenge-Verlauf

- Ziel: Den persoenlichen Challenge-Raum um einen kompakten, echten Verlauf aus
  gespeicherten Check-ins ergaenzen, ohne die oeffentliche SEO-Oberflaeche oder
  den Datenvertrag auszuweiten.
- Aenderungen: Reine Domainlogik erzeugt ein auf 84 Tage begrenztes Tagesmodell
  ab dem Teilnahme-Start mit den Zustaenden erledigt, verpasst und heute offen.
  Eine serverseitig gerenderte, zugaenglich beschriftete Heatmap samt Legende ist
  im geschuetzten Challenge-Raum zwischen Fortschritt und Ranking eingebunden.
  Das Todo fuer den privaten Verlauf wurde abgeschlossen.
- Verifikation: Neue Verlaufstests zuerst erwartungsgemaess am fehlenden Export
  gescheitert; danach `npm test` mit 52/52 bestandenen Tests. `npm run lint` ohne
  Fehler (15 bekannte Warnungen nur aus alten `.next-locked-*`-Artefakten) und
  `npm run build` mit 22 Seiten erfolgreich. Isolierter Production-E2E-Smoke auf
  Port 3129 mit temporaerer SQLite-DB bestaetigte Registrierung, Challenge-Start,
  offenen Tagesstatus, Statuswechsel nach Check-in, mobile 390px-Darstellung ohne
  horizontalen Overflow sowie weiterhin Canonical, JSON-LD und Sitemap-Eintrag
  der erstellten oeffentlichen Challenge. Temporaere DB und Server wurden beendet,
  Port 3129 ist frei; ein vor dem Build gefundener alter Previewprozess auf Port
  3117 wurde ebenfalls beendet. `git diff --check` erfolgreich.
- Offene Risiken: Die Heatmap zeigt bewusst nur ein rollierendes 84-Tage-Fenster;
  ein vollstaendiges Archiv oder Reminder sind nicht Teil dieser Slice.
  SQLite/`node:sqlite` bleibt experimentell, alte `.next-locked-*`-Artefakte
  blieben unangetastet.
- Naechster Schritt: Als naechste kleine Produktslice Reminder-Anforderungen fuer
  `Meine Challenges` fachlich schneiden oder nach Freigabe PostgreSQL-Migrationen
  gegen eine isolierte Testinstanz ausfuehren.

## 2026-07-23 - Echte Umlaute und ß in allen Nutzertexten

- Ziel: Sichtbares Deutsch auf allen Seiten konsequent mit `ä`, `ö`, `ü` und `ß`
  statt ASCII-Umschreibungen ausgeben.
- Änderungen: Nutzertexte, Metadata, Fehlermeldungen, Accessibility-Labels,
  Challenge-Inhalte und Wissensartikel in `app`, `components` und `data`
  bereinigt. Technische Slugs, URLs und interne Bezeichner blieben unverändert.
- Absicherung: Neuer Quelltext-Regressionstest prüft alle Nutzertextquellen auf
  bekannte deutsche ASCII-Umschreibungen und maskiert technische Slugs und URLs.
- Verifikation: `npm test` mit 53/53 Tests, `npm run lint` ohne Fehler (15 bekannte
  Warnungen aus alten `.next-locked-*`-Artefakten), `npm run build` mit 22 Seiten
  und 10/10 Playwright-E2E-Tests erfolgreich. Browser-Smoke bestätigte unter
  anderem `Zurück`, `Fußballtraining`, `Schrittzähler`, `hält`, `längsten` und
  `Aktivitäten` auf der öffentlichen Challenge-Seite.
- Kein Deployment, Push oder Commit.

## 2026-07-23 - Kanonische Breadcrumb-Strukturdaten für Challenge-Seiten

- Ziel: Die SEO-Hierarchie öffentlicher Challenge-Detailseiten als kleine, crawlbare Slice eindeutig auszeichnen, ohne URLs, sichtbares Layout oder API-Verträge zu verändern.
- Änderungen: Gemeinsamen `BreadcrumbList`-Builder für die kanonische Hierarchie Startseite -> Challenges -> Detailseite ergänzt und in die JSON-LD-Graphen kuratierter sowie veröffentlichter Community-Challenges eingebunden. ESLint ignoriert nun vorhandene `.next-locked-*`-Buildartefakte, damit generierte Fremdartefakte die Quellcodeprüfung nicht verfälschen; es wurde kein neues Archiv erzeugt und kein vorhandenes gelöscht.
- Verifikation: `npm test` mit 54/54 bestandenen Tests; `npm run lint` ohne Fehler; `npm run build` mit 22 Seiten erfolgreich. Temporärer Production-Smoke auf Port 3141 bestätigte HTTP 200, exakten Canonical, serverseitiges H1 und drei kanonische `BreadcrumbList`-Einträge. Server beendet und Port 3141 anschließend als frei verifiziert; `git diff --check` erfolgreich.
- Offene Risiken: Finale Social-Preview-Bilder und redaktionell freigegebene SEO-/Rechtstexte fehlen weiterhin. SQLite/`node:sqlite` bleibt experimentell; vorhandene unversionierte `.next-locked-*`-Artefakte wurden entsprechend Vorgabe nicht angefasst.
- Nächster Schritt: Als kleine Produktslice Reminder-Anforderungen für `Meine Challenges` fachlich eingrenzen oder nach Freigabe PostgreSQL-Migrationen gegen eine isolierte Testinstanz verifizieren.
- Kein Deployment, Push oder Commit.

## 2026-07-23 - Kanonischer Challenge-Katalog als ItemList

- Ziel: Den serverseitig crawlbaren Challenge-Katalog mit einer eindeutigen kanonischen URL und strukturierten Links auf alle öffentlichen Detailseiten absichern.
- Änderungen: `/challenges` liefert nun auch bei Such- und Sortierparametern den Canonical sowie die Open-Graph-URL `https://challengehub.de/challenges`. Eine serverseitige `ItemList` zeichnet kuratierte und veröffentlichte Community-Challenges in stabiler Reihenfolge mit kanonischen Detail-URLs aus; Slug-Duplikate behalten den zuerst gelisteten kuratierten Eintrag. Builder-Test und SEO-Todo wurden ergänzt.
- Verifikation: Der neue Test deckte zunächst auf, dass die erste Deduplizierung den letzten statt den kuratierten Eintrag behielt; nach Korrektur bestanden `npm test` mit 55/55 Tests, `npm run lint` ohne Fehler und `npm run build` mit 22 Seiten. Temporärer Production-Smoke auf Port 3157 bestätigte HTTP 200, Canonical ohne Query, Open-Graph-URL, serverseitiges H1, `ItemList`-ID und eine kanonische Challenge-Detail-URL. Server samt Kindprozess beendet und Port 3157 anschließend als frei verifiziert; `git diff --check` erfolgreich.
- Offene Risiken: Ein zusätzlicher Wiederholungsbuild traf zunächst einen Windows-`EPERM`-Fehler auf einem veralteten `.next/static`-Build-ID-Unterverzeichnis. Ursache war ein noch laufender alter Projekt-Preview auf Port 3141 sowie das anschließend als schreibgeschützt verbliebene generierte Unterverzeichnis. Der Preview wurde beendet, ausschließlich dieses generierte Unterverzeichnis entfernt und der aktuelle Quellstand danach erneut erfolgreich gebaut; es wurde kein `.next-locked-*`-Archiv erzeugt. Finale Social-Preview-Bilder und redaktionell freigegebene SEO-/Rechtstexte fehlen weiterhin. SQLite/`node:sqlite` bleibt experimentell; vorhandene unversionierte `.next-locked-*`-Artefakte wurden nicht verändert.
- Nächster Schritt: Als nächste kleine SEO-Slice den Wissenskatalog auf eindeutigen Canonical und eine serverseitige `ItemList` seiner crawlbaren Artikel prüfen und bei Bedarf analog absichern.
- Kein Deployment, Push oder Commit.

## 2026-07-24 - Kanonischer Wissenskatalog als ItemList

- Ziel: Den crawlbaren Wissenskatalog analog zum Challenge-Katalog mit stabilen Metadaten und strukturierten internen Artikellinks absichern.
- Änderungen: Gemeinsamen `ItemList`-Builder für Wissensartikel ergänzt und serverseitig in `/wissen` eingebunden. Die bestehende Reihenfolge der Artikel wird mit kanonischen `https://challengehub.de/wissen/[slug]`-URLs ausgezeichnet; Canonical und Open-Graph-URL bleiben auch bei Query-Parametern auf `/wissen`. SEO-Todo abgeschlossen.
- Verifikation: Neuer Builder-Test zunächst erwartungsgemäß wegen des fehlenden Exports fehlgeschlagen; danach `npm test` mit 56/56 bestandenen Tests, `npm run lint` ohne Fehler und `npm run build` mit 22 Seiten erfolgreich. Temporärer Production-Smoke auf Port 3169 bestätigte HTTP 200, serverseitiges H1, Canonical ohne Query, Open-Graph-URL und eine `ItemList` mit allen drei kanonischen Artikel-URLs. Preview beendet und Port 3169 anschließend als frei verifiziert; `git diff --check` erfolgreich.
- Offene Risiken: Finale Social-Preview-Bilder und redaktionell freigegebene SEO-/Rechtstexte fehlen weiterhin. SQLite/`node:sqlite` bleibt experimentell; vorhandene unversionierte `.next-locked-*`-Artefakte wurden nicht verändert.
- Nächster Schritt: Als nächste kleine SEO-Slice die Wissensartikel um eine kanonische `BreadcrumbList` für Startseite, Wissenskatalog und Artikel ergänzen.
- Kein Deployment, Push oder Commit.

## 2026-07-24 - Challenge-Teilnahme sicher verlassen

- Ziel: Eine aktive Challenge-Teilnahme sicher beenden, ohne den bisherigen
  Check-in-Verlauf zu verlieren.
- Änderungen: Das Teilnahme-Repository beendet ausschließlich eigene aktive
  Teilnahmen, setzt den Status idempotent auf `cancelled` und speichert den
  Beendigungszeitpunkt. Der Challenge-Raum zeigt eine zweistufige
  Sicherheitsabfrage; beendete Teilnahmen bleiben als Archiv mit Status und
  Verlauf sichtbar. Neue Check-ins und Einladungen sind danach sowohl in der
  Oberfläche als auch serverseitig gesperrt.
- TDD: Repositorytests schlugen zunächst wegen der fehlenden Leave-Methode,
  der fehlenden Idempotenz-Erkennung und erlaubter Check-ins auf beendeten
  Teilnahmen fehl. Nach der Implementierung bestanden alle neuen Tests.
- Verifikation: `npm test` mit 59/59 Tests, `npm run lint` ohne Fehler,
  `npm run build` mit 22 Seiten und 10/10 Playwright-E2E-Tests erfolgreich.
  Der E2E-Kernflow bestätigt Sicherheitsabfrage, Redirect und sichtbaren
  Archivstatus `Beendet`.
- Offene Risiken: Das bestehende Feld `completed_at` speichert derzeit sowohl
  regulären Abschluss als auch vorzeitiges Verlassen; eine feinere Eventhistorie
  bleibt eine spätere Schema-Slice. SQLite/`node:sqlite` bleibt experimentell.
- Kein Deployment, Push oder Commit.

## 2026-07-24 - Kanonische Breadcrumbs für Wissensartikel

- Ziel: Crawlbare Wissensartikel um die eindeutige SEO-Hierarchie Startseite,
  Wissenskatalog und Artikel ergänzen.
- Änderungen: Gemeinsamen `BreadcrumbList`-Builder für Wissensartikel angelegt
  und zusammen mit dem bestehenden `Article` in einen serverseitigen JSON-LD-
  Graphen eingebunden. Kanonische URLs, sichtbare Inhalte und Layout blieben
  unverändert; SEO-Todo abgeschlossen.
- TDD: Der neue Builder-Test schlug zunächst erwartungsgemäß wegen des fehlenden
  Exports fehl und bestand nach der minimalen Implementierung.
- Verifikation: `npm test` mit 60/60 Tests, `npm run lint` ohne Fehler und
  `npm run build` mit 22 Seiten erfolgreich. Temporärer Production-Smoke auf
  Port 3181 bestätigte HTTP 200, exakten Title, Canonical ohne Query,
  serverseitiges H1, `Article`-ID und alle drei kanonischen Breadcrumb-Einträge.
  Preview samt Kindprozess beendet; Port 3181 frei und kein Projekt-Next-Prozess
  mehr aktiv. Ein vor dem Build gefundener alter Preview auf Port 3025 wurde
  entsprechend der Build-Regel beendet.
- Offene Risiken: Finale Social-Preview-Bilder und redaktionell freigegebene SEO-/
  Rechtstexte fehlen weiterhin. SQLite/`node:sqlite` bleibt experimentell;
  vorhandene `.next-locked-*`-Artefakte wurden nicht verändert.
- Nächster Schritt: Als kleine SEO-Slice die Homepage auf kanonische `WebSite`-/
  `Organization`-Strukturdaten und stabile Suchmaschinenmarker prüfen.
- Kein Deployment, Push oder Commit.

## 2026-07-24 - Profilmenü und Katalog-Toolbar ausgerichtet

- Ziel: Die gemeldeten Layoutfehler im eingeloggten Profilmenü und in der
  Filterleiste des Challenge-Katalogs beheben.
- Ursache: Eine zu breite Navigationsregel überschrieb das horizontale Padding
  der Dropdown-Links. Filter- und CTA-Buttons wurden durch vertikales Padding
  höher als Suchfeld und Sortierauswahl. Der in einem älteren Tab oben sichtbare
  Footer ließ sich in einem frischen Browserkontext nicht reproduzieren; DOM,
  Stacking und Footer-Reihenfolge waren korrekt.
- Änderungen: Navigationsregeln auf direkte Links begrenzt, Dropdown-Einträge
  wieder mit konsistentem Innenabstand dargestellt und alle vier Toolbar-
  Bedienelemente auf exakt 44 Pixel Höhe vereinheitlicht.
- Absicherung: Neuer eingeloggter Playwright-Test prüft Footer-Reihenfolge,
  Dropdown-Ausrichtung und -Padding sowie identische Oberkante und Höhe aller
  Toolbar-Bedienelemente.
- Verifikation: `npm test` mit 60/60 Tests, `npm run lint` ohne Fehler,
  `npm run build` mit 22 Seiten und 11/11 Playwright-E2E-Tests erfolgreich.
  Browser-Smoke bestätigte die ausgerichtete Toolbar und den Footer unter dem
  vollständigen Seiteninhalt. `git diff --check` erfolgreich.
- Kein Deployment, Push oder Commit.

## 2026-07-24 - Homepage als WebSite und Organization ausgezeichnet

- Ziel: Die kanonische Homepage für Suchmaschinen eindeutig als Website und
  Organisation auszeichnen und die vorhandene Challenge-Suche semantisch
  verknüpfen.
- Änderungen: Explizite Homepage-Metadaten mit Canonical und Open-Graph-URL
  ergänzt. Ein serverseitiger JSON-LD-Graph verbindet `Organization`, `WebSite`,
  Logo und die drei offiziellen Social-Profile. Eine `SearchAction` verweist auf
  die bestehende Suchroute `/challenges?suche={search_term_string}`.
- TDD: Der Builder-Test schlug zunächst wegen des fehlenden Exports fehl und
  bestand nach der minimalen Implementierung.
- Verifikation: `npm test` mit 61/61 Tests, `npm run lint` ohne Fehler,
  `npm run build` mit 22 Seiten und 11/11 Playwright-E2E-Tests erfolgreich.
  Browser-Smoke bestätigte Canonical, Open-Graph-URL, beide kanonischen IDs und
  das Suchziel auch bei einem Tracking-Queryparameter. `git diff --check`
  erfolgreich.
- Offene Risiken: Finale Social-Preview-Bilder und redaktionell freigegebene
  Homepage-Texte bleiben offen. SQLite/`node:sqlite` bleibt experimentell.
- Nächster Schritt: Passwort-Reset als sichere vertikale Produktslice mit
  gehashtem, kurzlebigem Einmal-Token und neutraler Request-Antwort vorbereiten.
- Kein Deployment, Push oder Commit.

## 2026-07-24 - Sicherer Passwort-Reset umgesetzt

- Ziel: Vergessene Passwörter ohne Account-Erkennung zurücksetzen und nach der
  Änderung alle bestehenden Sitzungen sicher beenden.
- Änderungen: Der Login-Dialog verlinkt eine neue noindex-Anforderungsseite.
  Reset-Anfragen antworten unabhängig von der Kontoexistenz gleich, erzeugen
  256-Bit-Tokens mit 30 Minuten Laufzeit und speichern ausschließlich deren
  SHA-256-Hash. Neue Anfragen widerrufen ältere offene Tokens.
- Abschluss: Die noindex-Resetseite akzeptiert den Einmal-Link, validiert zwei
  neue Passworteingaben, ändert das Passwort atomar, verbraucht das Token und
  löscht sämtliche Sessions des Kontos. Ungültige, abgelaufene und bereits
  verwendete Links bleiben gesperrt.
- Persistenz: SQLite-Schema, Repositoryvertrag und PostgreSQL-Migration
  `0005_password_reset_tokens.sql` ergänzt.
- E-Mail: Ein getesteter Resend-Adapter ist vorhanden. Ohne `RESEND_API_KEY` und
  `PASSWORD_RESET_FROM_EMAIL` erfolgt absichtlich kein externer Versand; die
  öffentliche Antwort bleibt neutral.
- Verifikation: `npm test` mit 71/71 Tests, `npm run lint` ohne Fehler,
  `npm run build` mit 24 Seiten und 13/13 Playwright-E2E-Tests erfolgreich.
  Browser-Smoke bestätigte Anforderungsformular, neutrale Erfolgsmeldung,
  noindex-Metadaten und die Seite für das neue Passwort. `git diff --check`
  erfolgreich.
- Kein Deployment, Push oder Commit.

## 2026-07-24 - PostgreSQL-Migrationshistorie gegen Drift abgesichert

- Ziel: Die versionierten PostgreSQL-Migrationen vor stillen nachträglichen
  Änderungen schützen, bevor sie in einer freigegebenen Umgebung angewendet
  werden.
- Änderungen: Versionierte SHA-256-Prüfsummenliste für alle fünf vorhandenen
  Migrationen ergänzt; automatischer Test prüft vollständige, geordnete
  Abdeckung und den Dateiinhalt. Migrationsdokumentation um Prüfbefehl sowie die
  bereits vorhandenen Migrationen für Benutzernamen und Passwort-Reset ergänzt;
  Architektur-Todo abgeschlossen.
- Verifikation: `sha256sum -c checksums.sha256` meldet 5/5 Dateien `OK`;
  `npm test` mit 72/72 Tests, `npm run lint` ohne Fehler und `npm run build` mit
  24 Seiten erfolgreich. Temporärer Production-Smoke auf Port 3193 bestätigte
  HTTP 200, Canonical, H1-/Titelmarker, `BreadcrumbList` und Robots-Sitemap-
  Marker. Server beendet; kein Next-Prozess und kein Listener auf Port 3193
  aktiv. `git diff --check` erfolgreich.
- Offene Risiken: Die Migrationen wurden weiterhin mangels freigegebener
  PostgreSQL-Testinstanz nicht real angewendet. SQLite/`node:sqlite` bleibt die
  experimentelle Runtime. Neue Migrationen müssen künftig zusammen mit ihrem
  neuen Prüfsummeneintrag versioniert werden.
- Nächster Schritt: PostgreSQL-Migrationen nach Freigabe gegen eine isolierte
  Testinstanz anwenden oder einen typisierten API-Client für den bestehenden
  `v1`-Vertrag als kleine Expo-Vorbereitung schneiden.
- Kein Deployment, Push oder Commit.

## 2026-07-24 - Typisierter Client für öffentliche Challenge-API

- Ziel: Den bestehenden öffentlichen `v1`-Vertrag als kleine, frameworkfreie
  Grundlage für spätere Web- und Expo-Clients nutzbar machen.
- Änderungen: Fetch-basierter Client für paginierte Challenge-Listen und
  Challenge-Details ergänzt. Er normalisiert die Basis-URL, kodiert Slugs,
  validiert Pagination vor dem Request, reicht strukturierte HTTP-Fehler mit
  Status und Code weiter und verwirft unerwartete Versionen oder Vertragsdrift
  durch Laufzeitvalidierung. Vier isolierte Clienttests decken URL-Aufbau,
  Detailabruf, API-Fehler und ungültige Antworten ab. Öffentliche Seiten,
  Metadaten, URLs und Rendering wurden nicht verändert.
- Verifikation: `npm test` mit 76/76 Tests, `npm run lint` ohne Fehler und
  `npm run build` mit 24 Seiten erfolgreich. Temporärer Production-Smoke auf
  Port 50011 rief Liste und Detail über den neuen Client real ab und bestätigte
  drei serverseitige SEO-Marker (H1, Canonical, `BreadcrumbList`) der
  10.000-Schritte-Seite. Preview samt verbliebenem Kindprozess beendet; Port
  50011 frei und kein Projekt-Next-Prozess aktiv. `git diff --check` für die
  neuen Implementierungsdateien erfolgreich.
- Offene Risiken: Der Client ist noch nicht als eigenständiges Paket exportiert
  oder in eine Expo-App eingebunden. API-Version und erlaubte Level werden zur
  Expo-kompatiblen Laufzeitvalidierung lokal gespiegelt; bei einem späteren `v2`
  sollte ein reines, gemeinsam paketierbares Vertragsmodul entstehen.
- Nächster Schritt: PostgreSQL-Migrationen nach ausdrücklicher Freigabe gegen
  eine isolierte Testinstanz anwenden oder als sichere Produktslice Reminder für
  `Meine Challenges` fachlich spezifizieren.
- Kein Deployment, Push oder Commit.

## 2026-07-25 - Tägliche Kalender-Erinnerung für aktive Challenges

- Ziel: Reminder als kleine, sofort nutzbare Produktslice im privaten Bereich
  `Meine Challenges` anbieten, ohne E-Mail-Infrastruktur oder neue Persistenz
  vorwegzunehmen.
- Änderungen: Aktive Challenge-Räume zeigen einen responsiven Reminder-Bereich.
  Der geschützte Download-Endpunkt prüft Sitzung, Eigentum und aktiven Status und
  liefert eine iCalendar-Datei mit täglichem Termin um 18 Uhr, 15-Minuten-Alarm
  und Link zur kanonischen Challenge-Seite. Antworten sind nicht cachebar und
  per `X-Robots-Tag` von der Indexierung ausgeschlossen; beendete oder fremde
  Teilnahmen liefern keine Kalenderdatei. Todo ergänzt und abgeschlossen.
- Verifikation: `npm test` mit 78/78 Tests, `npm run lint` ohne Fehler und
  `npm run build` einschließlich neuer Reminder-Route erfolgreich. Isolierter
  Production-Smoke auf Port 50125 bestätigte 2/2 gezielte Playwright-Tests einschließlich sichtbarem
  Download und real abgerufenem `text/calendar` mit täglicher Wiederholung.
  Öffentliche Challenge-Seite behielt H1, Canonical und `BreadcrumbList`; der
  private Endpunkt antwortete ohne Sitzung mit HTTP 401. Preview samt
  Kindprozess beendet, Port freigegeben und temporäre Datenbank entfernt.
- Offene Risiken: Der importierte Kalendertermin läuft unabhängig von einem
  späteren Challenge-Austritt weiter und muss dann in der Kalender-App gelöscht
  werden. Uhrzeit und Wiederholung können derzeit erst nach dem Import im
  Kalender angepasst werden. SQLite/`node:sqlite` bleibt experimentell.
- Nächster Schritt: Reminder bei Bedarf um eine auswählbare Uhrzeit ergänzen oder
  nach ausdrücklicher Freigabe Resend/PostgreSQL in isolierter Umgebung real
  konfigurieren und verifizieren.
- Kein Deployment, Push oder Commit.

## 2026-07-25 - Challenge-spezifische Social-Preview-Bilder

- Ziel: Öffentliche Challenge-Detailseiten beim Teilen mit einem eindeutigen,
  performanten Vorschaubild statt einer generischen kleinen Social Card ausliefern.
- Änderungen: Dynamische Next.js-`ImageResponse`-Route für kuratierte und
  veröffentlichte Community-Challenges ergänzt. Das 1200x630-Bild rendert Marke,
  Challenge-Titel und fachliches Label serverseitig ohne externe Assets. Open
  Graph und Twitter verweisen kanonisch auf diese Route; Twitter nutzt nun
  `summary_large_image`. Ein gemeinsamer Metadata-Builder und Regressionstest
  sichern URL, Maße und Alt-Text ab; SEO-Todo um den abgeschlossenen Teilschritt
  ergänzt.
- Verifikation: `npm test` mit 79/79 Tests, `npm run lint` ohne Fehler und
  `npm run build` mit erfolgreicher dynamischer Open-Graph-Route. Temporärer
  Production-Smoke auf Port 50237 bestätigte HTTP 200, Canonical ohne
  Tracking-Query, `og:image`, `summary_large_image`, `BreadcrumbList` sowie ein
  real abgerufenes PNG mit HTTP 200, `image/png` und exakt 1200x630 Pixeln.
  Preview beendet; kein dauerhafter Server wurde belassen.
- Offene Risiken: Die visuelle Gestaltung und die redaktionellen SEO-Texte/
  Keywords sind noch nicht final von Stefan freigegeben. Community-Bildaufrufe
  lesen wie die Detailseite weiterhin aus der experimentellen SQLite-Runtime.
- Nächster Schritt: Social-Preview visuell abnehmen und anschließend finale
  Keywords/Texte je Challenge redaktionell festlegen oder die Bildstrategie
  analog auf Wissensartikel erweitern.
- Kein Deployment, Push oder Commit.

## 2026-07-25 - Social-Preview-Bilder für Wissensartikel

- Ziel: Die crawlbaren Wissensartikel beim Teilen mit einer großen, eindeutigen
  Vorschau ausstatten, ohne Inhalte, URLs oder Seitenlayout zu verändern.
- Änderungen: Für alle drei Wissensartikel eine statisch vorgerenderte Next.js-
  `ImageResponse`-Route mit Marke, Kategorie und Artikeltitel ergänzt. Open Graph,
  Twitter und `Article`-JSON-LD verweisen auf die kanonische 1200x630-Bildroute;
  Twitter nutzt nun `summary_large_image`. Ein Metadata-Builder und Regressionstest
  sichern URL, Maße und Alt-Text ab; Todo aktualisiert.
- Verifikation: Der neue Test schlug zunächst erwartungsgemäß wegen des fehlenden
  Builders fehl. Danach bestanden `npm test` mit 80/80 Tests, `npm run lint` ohne
  Fehler und `npm run build` mit drei erfolgreich vorgerenderten Wissensbildrouten.
  Temporärer Production-Smoke auf Port 50341 bestätigte HTTP 200, Canonical ohne
  Tracking-Query, `og:image`, `summary_large_image`, `BreadcrumbList`, das
  JSON-LD-Bild sowie ein real abgerufenes PNG mit exakt 1200x630 Pixeln. Mobile
  390px ohne horizontalen Overflow; Preview beendet und Port als frei verifiziert.
- Offene Risiken: Gestaltung und redaktionelle SEO-Texte sind noch nicht final
  freigegeben. Die Wissensartikel selbst sind weiterhin ein kleiner Startbestand.
- Nächster Schritt: Social-Preview-Design visuell abnehmen und anschließend
  finale Keywords/Texte je Challenge und Wissensartikel redaktionell festlegen.
- Kein Deployment, Push oder Commit.

## 2026-07-26 - Review-Blocker nach GitHub-Checkpoint behoben

- Ziel: Die nach dem GitHub-Push eingetroffene unabhängige Sicherheits- und
  Logikprüfung vollständig abarbeiten.
- Änderungen: Einladungsannahme auf Community-Challenge-Detailseiten ergänzt und
  per vollständigem Zwei-Nutzer-E2E-Flow abgesichert. Passwort-Reset antwortet
  vor Accountprüfung und E-Mail-Versand, führt beides mit Next.js `after()` nach
  der Response aus und begrenzt Anfragen persistent auf drei je E-Mail sowie
  zehn je IP und Stunde. Nur Identifier-Hashes werden gespeichert. Fehlgeschlagene
  Zustellungen verwerfen das neue Token, ohne ältere gültige Links zu widerrufen.
  PostgreSQL-Migration `0006` samt Prüfsumme ergänzt. Zusätzlich Open Redirects
  mit Backslashes geschlossen, Username-Bestandsmigration kollisionsfest gemacht
  und Community-Nutzer serverseitig auf den Challenge-Typ `User` begrenzt.
- Verifikation: `npm test` mit 86/86 Tests, ESLint ohne Fehler, Produktions-Build
  mit 27 Routen und `git diff --check` erfolgreich. Playwright vollständig mit
  14/14 E2E-Tests grün, einschließlich Community-Einladung und Passwort-Reset.
- Offene Risiken: Produktiver Reset-Versand benötigt weiterhin freigegebene
  Resend-Konfiguration. IP-Limits setzen im Zielbetrieb vertrauenswürdige
  `x-forwarded-for`-Header des Reverse Proxys voraus.
- Kein Deployment.

## 2026-07-26 - Zweite Reviewrunde für Reset-Härtung geschlossen

- Ziel: Die drei verbliebenen Blocker der unabhängigen Follow-up-Prüfung beheben.
- Änderungen: Reset-Token-Bestätigung invalidiert nur noch tatsächlich ältere
  Tokens anhand Erstellzeit und SQLite-Reihenfolge; ein Paralleltest reproduziert
  und verhindert die Zustellungs-Race-Condition. Rate-Limit-Identifier werden nun
  mit einem geheimnisgebundenen HMAC statt ungesalzenem SHA-256 persistiert; lokal
  dient ein pro Prozess zufälliges Secret als sicherer Fallback. Die noch nicht
  produktiv angewendete PostgreSQL-Username-Migration `0004` wurde vor Anwendung
  auf eine kollisionsfeste Schleife umgestellt und ihre Prüfsumme aktualisiert.
- Verifikation: Fokussierte 17/17 Tests für Reset-Repository, Rate-Limit und
  PostgreSQL-Migrationen erfolgreich.
- Offene Risiken: Für neustartstabile Produktionslimits muss
  `PASSWORD_RESET_RATE_LIMIT_SECRET` im Zielbetrieb gesetzt werden.
- Kein Deployment.

## 2026-07-26 - Profilgrundlage und Benutzernamenverwaltung umgesetzt

- Ziel: Das im Profilmenü sichtbare Namensproblem durch eine echte, geschützte
  Kontoverwaltung lösbar machen.
- Änderungen: Neue Route `/profil` mit nicht indexierbarer Kontoseite,
  unveränderter E-Mail-Anzeige und änderbarem Benutzernamen. Der Name wird
  serverseitig auf 2 bis 30 Zeichen ohne `@` validiert, getrimmt und atomar
  case-insensitiv eindeutig gespeichert. Das Profilmenü verlinkt die Seite und
  zeigt nach dem Speichern sofort den aktualisierten Namen. Die gemeinsame
  Validierung wird auch von der Registrierung genutzt.
- Tests: Repository-Tests für Änderung und Namenskonflikt, Domain-Tests für
  Validierung sowie Playwright-E2E vom neuen Account über das Profilmenü bis zum
  aktualisierten Header ergänzt.
- Visuelle Prüfung: Desktop-Profilseite lokal ohne Überlappungen, abgeschnittene
  Inhalte oder auffällige Layoutprobleme geprüft.
- Unabhängiger Review: Eine Unicode-Lücke von SQLite `NOCASE` wurde gefunden und
  geschlossen. Normalisierte Unicode-Schlüssel (`NFKC` plus deutsche
  Groß-/Kleinschreibungsfaltung) werden nun separat gespeichert und durch einen echten
  Unique-Index atomar geschützt; Bestandsdaten werden idempotent migriert.
- Zusätzliche Abdeckung: Unicode-Konflikt `Änne`/`änne`, produktionsnaher
  Unique-Index, anonymer Profilzugriff und Fehlermeldung bei vergebenem Namen.
- Re-Review-Nachbesserungen: Unicode-Sonderfälle für griechisches Sigma und `ß`
  abgesichert, bestehende Namensschlüssel bei geänderter Faltung neu aufgebaut,
  Systemnutzer-Bootstrap an `name_key` angepasst und einen direkten anonymen
  Server-Action-Aufruf ohne Mutation per E2E geprüft.
- Final-Review-Nachbesserungen: Der Action-Test spielt nun einen nachweislich
  gültigen, zuvor vom Browser gesendeten Next-Action-Request ohne Cookies erneut
  ab und prüft den Auth-Redirect. Registrierung validiert die Länge nach NFKC,
  Upgrade-Datenbanken erzwingen `name_key` zusätzlich per Trigger als `NOT NULL`,
  Steuer-/Bidi-/unsichtbare Namen werden abgelehnt und der interne Systemnutzer
  nutzt einen reservierten, nicht mit normalen Benutzernamen kollidierenden Key.
- Offene Risiken: Anzeigename, Avatar, Standort und Challenge-Mate-Sichtbarkeit
  bleiben bewusst spätere Profilslices. E-Mail-Änderung bleibt unverändert.
- Kein Deployment.

## 2026-07-27 - Top-20-Ranking und persönliche Nachbarpositionen

- Ziel: Das zentrale Challenge-Ranking über die bisherigen Top 10 hinaus
  aussagekräftiger machen und die eigene Position auch außerhalb der Spitze
  sichtbar halten.
- Änderungen: Rankingtabellen zeigen jetzt die Top 20. Befindet sich die aktive
  eigene Teilnahme dahinter, folgt ein klar getrennter persönlicher Ausschnitt
  mit bis zu zwei direkten Positionen davor und danach. Bereits sichtbare
  Top-20-Zeilen werden nicht dupliziert; die eigene Zeile ist hervorgehoben und
  mit `(du)` gekennzeichnet. Öffentliche kuratierte Challenge-Seiten übergeben
  dafür die aktive Teilnahme des eingeloggten Nutzers.
- Tests: Drei Domain-Regressionstests für Top-20-Auswahl, Rang-21-Grenze und
  Nutzer innerhalb der Top 20 ergänzt. Der bestehende Teilnahme-E2E prüft nach
  der Registrierung die Top-20-Überschrift, die eigene markierte Rankingzeile
  sowie fehlenden horizontalen Overflow bei 390 Pixel Breite.
- Verifikation: 98/98 Unit-Tests, ESLint, Produktions-Build und 19/19
  Playwright-E2E-Tests erfolgreich. Desktop-Ranking mit 20 echten Zeilen
  zusätzlich visuell ohne Überlappungen oder abgeschnittene Tabellenspalten
  geprüft.
- Offenes Risiko: Die bestehende Sortierung nach Streak, Quote, erfüllten Tagen
  und Startdatum bleibt bewusst unverändert. Absolute/relative Wertung und die
  100-Tage-Mindestbasis sind ein eigener Folgeslice.
- Kein Deployment.

## 2026-07-28 - E2E-Datenbank vollständig isoliert

- Ziel: Den P0-Auditblocker schließen, durch den Playwright bisher Testkonten,
  Challenges, Teilnahmen und Check-ins in die normale lokale SQLite-Datenbank
  schrieb und damit Katalog, Rankings sowie Sitemap verunreinigte.
- Änderungen: `npm run test:e2e` startet nun einen eigenen Next.js-Testserver,
  erzwingt `CHALLENGEHUB_DB_PATH` auf einer pro Lauf frischen Datenbank im
  Betriebssystem-Temp-Verzeichnis und entfernt dieses Verzeichnis anschließend
  auch bei fehlgeschlagenen Testprozessen. Ein bereits laufender Server wird
  nicht wiederverwendet. Jeder Lauf erhält außerdem einen freien Port sowie ein
  eigenes Next.js-Build-Verzeichnis und eine eigene temporäre TypeScript-Config;
  beide werden anschließend entfernt und die Projekt-`tsconfig.json` bleibt
  unverändert. Zwei E2E-Prozesse können dadurch parallel laufen. E2E läuft
  innerhalb eines Prozesses wegen der gemeinsam genutzten SQLite-Datei
  deterministisch mit einem Worker. Alternative
  Playwright-Configs, abweichende Ausgabeordner und Workerzahlen ungleich eins
  werden am Runner abgewehrt. Alle Laufpfade werden atomar angelegt sowie mit
  `lstat` und `realpath` gegen Symlink-/Junction-Umleitungen geprüft; auch
  Playwrights `outputDir` liegt pro Lauf im Temp-Verzeichnis. Portkollisionen
  lösen bis zu drei vollständige neue Laufumgebungen aus. Der asynchrone Runner
  leitet SIGINT/SIGTERM an Playwright weiter, räumt danach auf und erhält die
  üblichen Exitcodes. Der Browser ist nun das plattformübergreifend von
  Playwright verwaltete Chromium. Cleanup wiederholt Windows-Löschvorgänge und
  bewahrt bei Doppelfehlern den Teststatus.
  Passwort-Reset- und Profil-E2E verwenden ausschließlich die Laufzeitumgebung.
- TDD: Vierzehn Infrastruktur-Regressionstests einschließlich echter
  Windows-Junction jeweils rot und danach grün ausgeführt. Die
  vollständige E2E-Suite und ein paralleler Doppelstart deckten zusätzlich den
  hart codierten Reset-DB-Pfad, einen hart codierten Profil-Port, fehlende
  Clipboard-Rechte sowie den globalen Next.js-Dev-Lock auf; alle Ursachen wurden
  geschlossen. Ein unabhängiger Review hatte zuvor Config-/Worker-Umgehungen,
  Portkollision, Edge-Abhängigkeit und Windows-Cleanup als Blocker beanstandet.
  Der finale unabhängige Follow-up-Review des gehärteten Stands bestand ohne
  Security-Bedenken oder Logikfehler.
- Verifikation: 112/112 Unit-/Infrastrukturtests, ESLint und Produktions-Build
  erfolgreich; 19/19 Playwright-E2E-Tests grün. SHA-256 der normalen
  `.data/challengehub.sqlite` blieb vor und nach E2E identisch; keine temporären
  `challengehub-e2e-*`- oder `.next-e2e-*`-Verzeichnisse und kein lauschender
  Testserver blieben zurück. Zwei gleichzeitige isolierte E2E-Läufe bestanden;
  SHA-256 der Projekt-`tsconfig.json` blieb dabei ebenfalls identisch;
  `git diff --check` erfolgreich.
- Offene Risiken: Playwright meldet bestehendes Smooth-Scroll-Markup als
  Browserhinweis. Nicht abfangbare harte Prozessbeendigungen wie SIGKILL können
  naturgemäß keinen In-Process-Cleanup ausführen; reguläre Fehler sowie vom
  Betriebssystem zugestellte SIGINT-/SIGTERM-Abbrüche sind abgedeckt. Next.js
  16.2.7 bleibt bis zum nächsten separaten Slice auf der im Audit beanstandeten
  Version. Bestehende lokale Demo-/Testdaten wurden noch nicht bereinigt, damit
  keine Daten ohne separate Freigabe gelöscht werden.
- Nächster Schritt: Next.js und `eslint-config-next` kontrolliert auf eine aktuell
  gepatchte kompatible Version aktualisieren und den kompletten Gate-Satz erneut
  ausführen.
- Kein Deployment, Commit oder Push.

## 2026-07-28 – Launch-Sicherheit: Dependencies, Limits, Header, Moderation und 404

- Ziel: Die P0-/P1-Launch-Sicherheitsblöcke der 10/10-Roadmap schließen und mit
  realen Unit-, Build-, Browser- und Dependency-Nachweisen absichern.
- Änderungen: Next.js und `eslint-config-next` auf 16.2.12 aktualisiert;
  Produktionsgraph über sichere `postcss`-/`sharp`-Overrides gehärtet. Zentrale
  UTF-8-Eingabegrenzen, Dummy-KDF für unbekannte Logins und persistente,
  transaktionale HMAC-Rate-Limits für Auth, Reset, Challenge-Start/-Erstellung,
  Check-ins und Einladungen ergänzt. `RATE_LIMIT_SECRET` ist in Produktion
  fail-closed; Proxy-Header werden nur mit `TRUST_PROXY=true` ausgewertet.
- Persistenz: SQLite-Schema um Rate-Limit-Ereignisse ergänzt; PostgreSQL-
  Migrationen `0007_action_rate_limits.sql` und
  `0008_pending_challenge_default.sql` samt unveränderlichen Prüfsummen ergänzt.
- HTTP-Sicherheit: globale CSP, HSTS nur in Produktion, Clickjacking-, MIME-,
  Referrer-, Permissions- und Cross-Origin-Header, kein `X-Powered-By` sowie ein
  Server-Action-Bodylimit von 128 KB eingerichtet. Produktions-Smoke lieferte
  die erwarteten Header ohne Framework-Fingerabdruck.
- UGC/SEO: neue Community-Challenges werden als `pending` gespeichert, bleiben
  bis zur manuellen Freigabe aus öffentlichem Read-Modell, API und Sitemap und
  zeigen dem Ersteller einen neutralen Moderationsstatus. Unbekannte und pending
  Slugs liefern jetzt `notFound()`/HTTP 404 und eine deutsche markengerechte
  404-Seite; `/challenges/neu` ist `noindex`.
- Verifikation: unabhängiger Dependency-Review `passed: true`; `npm audit
  --omit=dev` 0 Funde; 125/125 Unit-/Infrastrukturtests, ESLint und Next.js-
  Produktionsbuild erfolgreich; 21/21 Playwright-E2E erfolgreich; normale
  SQLite-Datenbank und Root-`tsconfig.json` nach E2E unverändert; `git diff
  --check` ohne Fehler.
- Restrisiken: Die CSP benötigt wegen der aktuellen statischen Next.js-
  Auslieferung weiterhin `unsafe-inline`; `unsafe-eval` ist ausschließlich im
  Entwicklungsmodus aktiv. Produktive Secrets/Proxy-Konfiguration, externe
  Mailzustellung und Deployment bleiben ungeprüft und benötigen Freigabe.
- Nächster Schritt: Phase B mit gemeinsamen barrierefreien Dialog-/
  Menüprimitiven und vollständigen Fokus-/Tastatur-E2E-Nachweisen beginnen.
- Kein Deployment, Commit oder Push.

## 2026-07-28 – Barrierefreiheitsbasis und automatisierte WCAG-Prüfung

- Ziel: Phase B mit belastbarer Tastatur-, Fokus-, Kontrast- und Reduced-Motion-
  Basis beginnen, statt Barrierefreiheit nur visuell anzunehmen.
- Änderungen: Wiederverwendbaren Dialog-Fokus-Hook mit initialem Fokus,
  Tab-Fokusfalle, Escape, Fokus-Rückgabe und Body-Scroll-Lock eingeführt und im
  Login- sowie Filterdialog genutzt. Das Profilmenü schließt per Escape und gibt
  den Fokus an seinen Auslöser zurück. Auth-Fehler werden als `role="alert"`
  angekündigt.
- Navigation: globalen sichtbaren Skip-Link bei Fokus, konsistente
  `#main-content`-Ziele und `aria-current="page"` für den aktiven
  Challenge-Bereich ergänzt. `prefers-reduced-motion` deaktiviert sanftes
  Scrollen und verkürzt Animationen/Transitionen.
- Kontrast: zentrale Brand-, Orange-, Beginner-, Advanced- und User-Farbtokens
  auf WCAG-AA-taugliche Kontraste abgedunkelt.
- Testautomation: `@axe-core/playwright@4.12.1` exakt als Dev-Dependency ergänzt;
  Startseite, Challenge-Katalog und zentrale Challenge-Detailseite werden gegen
  WCAG 2 A/AA und 2.1 A/AA auf schwere/kritische Verstöße geprüft.
- Verifikation: 125/125 Unit-/Infrastrukturtests, ESLint und Produktionsbuild
  erfolgreich; vollständiger Playwright-Lauf 29/29 einschließlich 3/3
  Axe-Seiten sowie Fokus-, Scroll-Lock- und Alert-Nachweisen grün;
  Produktions-Audit weiterhin 0 Funde. E2E-Isolation ließ
  normale SQLite-Datenbank und Root-`tsconfig.json` unverändert.
- Restrisiken: Axe deckt nur automatisierbare Regeln ab. Manuelle NVDA-, Zoom-
  und Reflow-Prüfungen sowie vollständige Mobile-Menü-Navigation bleiben offen.
- Nächster Schritt: Startseite als klare deutschsprachige Social-
  Accountability-Landingpage entlang des echten Einladungs-/Challenge-Loops
  überarbeiten; keine erfundenen Nutzerzahlen oder Testimonials verwenden.
- Kein Deployment, Commit oder Push.

## 2026-07-28 – Security-Review geschlossen, Aktivierung und Katalog kuratiert

- Ziel: Die unabhängige Phase-A3-Nachprüfung auf den aktuellen Codebestand
  übertragen, echte Blocker schließen und anschließend die ersten
  Aktivierungs-/Katalog-Slices aus Phase B verifizieren.
- Review: Der gemeldete Reset-KDF-vor-Tokencheck war im aktuellen Stand bereits
  behoben und durch den bestehenden KDF-Aufrufnachweis abgedeckt. Die übrigen
  Blocker wurden reproduziert und testgetrieben geschlossen.
- Rate-Limits: globale 24-Stunden-Bereinigung abgelaufener Ereignisse ergänzt,
  ohne aktive längere Fenster zu löschen. SQLite erhält einen `created_at`-
  Index; PostgreSQL erhält die unveränderliche Migration
  `0009_rate_limit_pruning_index.sql` samt verifizierter SHA-256-Prüfsumme.
- Proxy/IP: Produktion verweigert IP-Limits ohne `TRUST_PROXY=true`; bei
  aktiviertem Proxy-Vertrauen wird ausschließlich die zuletzt vom direkten
  Proxy ergänzte, syntaktisch gültige IP verwendet. Ungültige Proxy-Header
  erzeugen keinen gemeinsam sperrbaren `unknown`-Bucket mehr.
- Eingaben: Rohgrößen greifen nun vor Unicode-Normalisierung, Listenaufteilung
  und Token-HMAC. Login-Identifier verwenden für den Rate-Limit-Bucket dieselbe
  E-Mail-/Unicode-Benutzernamen-Kanonisierung wie der Account-Lookup.
- Aktivierung: Startseite vollständig deutsch und auf den echten Loop
  Challenge wählen, Freund einladen und gemeinsam einchecken ausgerichtet;
  reale Produktvorschau, drei Start-Challenges, Trust-Bereich und klare CTAs
  ohne erfundene Kennzahlen ergänzt.
- Katalog: Ergebnisanzahl mit Live-Region, zwölf initiale Challenge-Karten,
  schrittweises Nachladen und Pagination-Reset bei Suche, Filter und Sortierung.
- Verifikation: 133/133 Unit-/Infrastrukturtests, ESLint, Produktionsbuild und
  32/32 Playwright-E2E einschließlich Axe erfolgreich; Produktions-Audit 0
  Funde, `git diff --check` ohne Fehler. E2E-Isolation ließ normale SQLite-DB
  und Root-`tsconfig.json` unverändert.
- Restrisiken: `TRUST_PROXY=true` darf produktiv nur gesetzt werden, wenn der
  App-Port nicht öffentlich erreichbar ist und Caddy Forwarding-Header ersetzt;
  dies muss vor einem Deployment anhand der Serverkonfiguration geprüft werden.
  Migration `0009` ist beim nächsten freigegebenen Deployment einzuspielen.
- Nächster Schritt: manuellen NVDA-/Zoom-/Reflow-Nachweis durchführen und danach
  Produktloop-/Retention-Slices der Roadmap fortsetzen.
- Kein Deployment, Commit oder Push.

## 2026-07-28 – Fokusindikator nach unabhängiger A11y-Nachprüfung gehärtet

- Befund: Der bisherige globale Fokus-Box-Shadow war mit rund 1,4:1 auf hellen
  Flächen zu kontrastarm und ersetzte zugleich den Browser-Outline.
- Änderung: Globalen zweifarbigen Fokusindikator eingeführt: drei Pixel opakes
  Brand-Teal mit zwei Pixel Abstand plus äußerer weißer Fünf-Pixel-Ring. Damit
  bleibt der Indikator sowohl auf hellen als auch dunklen Komponenten sichtbar.
- Kontrastnachweis: Teal `#00607d` erreicht 7,07:1 auf Weiß, 6,49:1 auf dem
  Seitenhintergrund und 6,10:1 auf gedecktem Weiß; der ergänzende weiße Ring
  erreicht auf den dunklen Challenge-Flächen mindestens 5,88:1.
- Regressionstest: Playwright prüft am fokussierten Skip-Link Outline-Farbe,
  -Stärke, -Abstand und den äußeren Ring; RED mit dem alten transparenten Ring,
  anschließend fokussiert 1/1 grün.
- Kein Deployment, Commit oder Push.

## 2026-08-09 – Launch-Checkpoint geprüft und 400-Prozent-Reflow gehärtet

- Ziel: Den seit dem letzten Checkpoint angesammelten Launch-Sicherheits-,
  Aktivierungs- und A11y-Stand erneut prüfen, sauber sichern und den offenen
  Reflow-Nachweis konkretisieren.
- Dependency-Nachprüfung: Ein inzwischen neu gemeldeter High-Severity-Befund
  für das transitive `nanoid@3.3.16` wurde über die zulässige Lockfile-Auflösung
  auf `nanoid@3.3.18` geschlossen; Produktions-Audit danach wieder ohne Funde.
- UI-Regelprüfung: Aktuelle Web Interface Guidelines gegen die bearbeiteten
  Komponenten geprüft; Ladezustände verwenden nun `…`, und Login-/E-Mail-Felder
  deaktivieren unpassende Rechtschreibprüfung.
- Reflow: Startseite bei effektiven 200 und 400 Prozent sowie Katalog und zentrale
  Challenge-Detailseite bei effektiv 400 Prozent im echten Chromium geprüft und
  als lokale, ignorierte Screenshots dokumentiert. Kein horizontaler
  Seitenüberlauf auf 640 beziehungsweise 320 CSS-Pixeln.
- Befunde und Fix: Der gemeinsame Zwei-Zeilen-Clamp schnitt die Info-Überschrift
  der Detailseite ab; feste mobile Rankingbreiten ließen `Teilnehmer` und
  `Streak` optisch kollidieren. Beide Ursachen testgetrieben geschlossen und mit
  zwei neuen 320-Pixel-E2E-Regressionstests abgesichert.
- Verifikation: 133/133 Unit-/Infrastrukturtests, ESLint, Produktionsbuild und
  35/35 Playwright-E2E-Tests einschließlich Axe und Reflow erfolgreich;
  `npm audit --omit=dev` ohne Funde.
- Offenes Risiko: Ein echter Tastaturdurchlauf mit Browserzoom 200/400 Prozent
  sowie der NVDA-Screenreader-Test benötigen weiterhin eine interaktive
  Windows-Desktop-Sitzung. Keine Produktions-, DNS-, Caddy- oder
  Serveränderungen vorgenommen.
- Nächster Schritt: Manuellen NVDA-/Browserzoom-Test abschließen; danach Roadmap-
  Task 11 zur fachlichen und visuellen Neuordnung der Challenge-Detailseite als
  eigenen kleinen Slice fortsetzen.
