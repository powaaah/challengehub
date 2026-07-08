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
