# ChallengeHub Pflichtenheft v0.1

Stand: 2026-07-07
Basis: `challengehub-lastenheft.md` und aktueller Next.js-/SQLite-Projektstand

## 1. Ziel dieses Pflichtenhefts

Dieses Pflichtenheft uebersetzt das Lastenheft in einen konkreten
Umsetzungsplan fuer das bestehende ChallengeHub-Projekt.

Das Ziel ist nicht, alle langfristigen Ideen sofort zu bauen, sondern den
ersten echten Produktkern belastbar umzusetzen:

> Ein Nutzer startet eine Dauer-Challenge, checkt regelmaessig ein, sieht
> seinen Fortschritt in einem Challenge-Raum und erscheint in einem echten
> Ranking, das aus gespeicherten Daten berechnet wird.

## 2. Ausgangslage im bestehenden Projekt

Bereits vorhanden:

- Next.js App Router mit TypeScript.
- CSS Modules und gemeinsame Site-Shell.
- Challenge-Katalog unter `/challenges`.
- Kuratierte Challenge-Detailseiten unter `/challenges/[slug]`.
- Login/Registrierung mit E-Mail/Passwort.
- SQLite-Datenbank mit `users`, `sessions`, `challenges`, `participations`
  und `check_ins`.
- Serverseitig gespeicherte oeffentliche Challenges.
- Lokaler Browser-MVP fuer aktive Challenges und Check-ins.
- `/meine-challenges` als persoenlicher Bereich.
- Vorbereitete Route `/challenge-mate`.
- Erste lokale Ranking-Tabelle im Hero der Challenge-Detailseite.

Noch nicht ausreichend umgesetzt:

- Challenge-Start schreibt noch nicht konsequent serverseitig in
  `participations`.
- Check-ins werden noch nicht fuer den Produktkern serverseitig genutzt.
- Es gibt noch keinen echten Challenge-Raum.
- Rankings werden noch nicht aus serverseitigen Check-ins berechnet.
- Freund-herausfordern / Einladungslinks fehlen.
- Proof-System fehlt.
- Profilseite ist noch nicht als Produktflaeche umgesetzt.

## 3. MVP-Definition

### 3.1 Zielnutzer

Deutschsprachige Nutzer, die persoenliche Ziele nicht allein verfolgen wollen
und durch sichtbare Verbindlichkeit, Ranking und gemeinsame Challenge-Raeume
dranbleiben.

### 3.2 Kernjob

Der Nutzer will eine Challenge starten, regelmaessig liefern, seinen Stand sehen
und mit anderen verglichen werden.

### 3.3 Wert im ersten Produkt-Slice

Der Nutzer kann:

1. eine offene Dauer-Challenge starten,
2. fuer heute einchecken,
3. seinen Streak und seine Erfuellungsquote sehen,
4. in einem Challenge-Raum seinen Stand und das Ranking sehen,
5. nach einem Reload mit erhaltenem Stand weitermachen.

### 3.4 Bewusst nicht im ersten technischen MVP

- Proof-Upload.
- Community-Bewertung von Proofs.
- Team-Challenges.
- Stadtgruppen.
- Firmen-/Coach-Funktionen.
- Geldpreise.
- Native App.
- Vollstaendiger Social Feed.
- Premium oder Payment.

## 4. Erste MVP-Challenge

Fuer den ersten echten technischen Slice wird eine offene Dauer-Challenge
umgesetzt:

> Ab heute jeden Tag 30 Minuten lesen

Begruendung:

- Sie zeigt den Kern von ChallengeHub: dranbleiben, Quote, Streak, Ranking.
- Sie braucht im ersten Schritt keinen Video-Proof.
- Sie ist niedrigschwellig und mobil gut nutzbar.
- Sie reduziert technische Ablenkung durch Upload, Tracking oder Formpruefung.

Danach werden `30 Tage 10.000 Schritte`, `30 Tage kein Zucker`,
`100 Liegestuetze am Stueck` und `100.000 Schritte an einem Tag` angebunden.

## 5. Informationsarchitektur

### 5.1 Startseite `/`

Aufgabe:

- Produktidee sofort erklaeren.
- Einstieg in Challenges anbieten.
- Wettbewerb/Ranking sichtbar machen.

Pflichtinhalte:

- Claim: `Fordere andere heraus. Zieh gemeinsam durch.`
- Primaerer CTA: `Challenge starten`.
- Sekundaerer CTA: `Freund herausfordern`.
- Top-Challenges.
- Auszug aus Rankings mit echten Daten oder ehrlichem Empty-State.

### 5.2 Challenge-Katalog `/challenges`

Aufgabe:

- Wenige passende Start-Challenges auffindbar machen.

Pflichtfunktionen:

- Liste kuratierter Challenges.
- Filter nach Challenge-Typ:
  - One-Shot
  - feste Dauer
  - offene Dauer
- Filter nach Kategorie:
  - Fitness
  - Gesundheit
  - Lernen
  - Disziplin
- Sortierung nach Relevanz, Teilnehmerzahl oder Ranking-Aktivitaet.
- CTA zum Vorschlagen neuer Challenges nur dezent nach erfolgloser Suche.

### 5.3 Challenge-Detailseite `/challenges/[slug]`

Aufgabe:

- Vor dem Start klaeren: Was ist die Challenge, warum teilnehmen, wer macht
  mit?

Pflichtinhalte:

- Titel.
- Ziel.
- Regeln.
- Beweisanforderung.
- Teilnehmerzahl.
- Erfolgsquote, sobald echte Daten vorhanden sind.
- Durchschnittlicher Abbruchtag fuer Dauer-Challenges, sobald Daten vorhanden
  sind.
- Kurzranking.
- CTA: `Jetzt teilnehmen`.
- CTA: `Freund herausfordern`.
- Challenge Mate / Partner finden.
- SEO-Infoteil am Ende.

Abgrenzung:

- Keine Reminder-Einstellungen.
- Keine persoenliche Heatmap.
- Kein vollstaendiger persoenlicher Fortschritt.
- Keine Dashboard-Funktionen.

Diese Inhalte gehoeren in `/meine-challenges` oder den Challenge-Raum.

### 5.4 Challenge-Raum `/meine-challenges/[participationId]`

Aufgabe:

- Nach dem Start ist der Challenge-Raum die zentrale Arbeitsflaeche.

Pflichtfunktionen:

- Challenge-Ziel und Status.
- Check-in fuer heute.
- Liste eigener Check-ins.
- Eigener Streak.
- Eigene Erfuellungsquote.
- Erfuellte Tage.
- Verpasste Tage.
- Teilnehmerliste.
- Ranking dieser Challenge.
- Aktivitaetsfeed mit echten Check-ins.
- Status: active, completed, failed, abandoned.

### 5.5 Ranking-Seite `/ranking`

Aufgabe:

- Wettbewerb zentral sichtbar machen.

Pflichtansichten:

- Gesamt.
- Nach Challenge.
- Nach Challenge-Typ.
- Streaks.
- Erfuellungsquote.
- Newcomer.

Pflichtspalten fuer Dauer-Challenges:

- Rang.
- Nutzer.
- Challenge.
- Aktuelle Serie.
- Laengste Serie.
- Erfuellte Tage.
- Verpasste Tage.
- Erfuellungsquote.
- Aktiv seit.
- Letzter Check-in.
- Proof-Status, sobald Proofs existieren.

### 5.6 Profilseite `/u/[username]` oder `/profil`

Aufgabe:

- Sichtbare Leistungsidentitaet eines Nutzers abbilden.

Pflichtinhalte MVP:

- Benutzername.
- Stadt optional.
- Aktive Challenges.
- Absolvierte Challenges.
- Erfolgsquote.
- Laengste Serie.
- Ranglistenpositionen.
- Badges spaeter.

### 5.7 Proof-Feed spaeter

Nicht Teil des ersten technischen MVP.

Wenn Proofs gebaut werden:

- Offene Proofs ansehen.
- Abstimmen: bestanden, nicht bestanden, unklar, Form unsauber.
- Kein Like-Feed.
- Kein Social-Media-Kommentarstrom als Hauptfunktion.

## 6. Datenmodell

Das bestehende SQLite-Modell wird erweitert statt neu erfunden.

### 6.1 Bestehende Tabellen

Bereits vorhanden:

- `users`
- `sessions`
- `challenges`
- `participations`
- `check_ins`

### 6.2 Erweiterung `users`

Neue Felder:

- `username TEXT UNIQUE`
- `city TEXT`
- `avatar_url TEXT`
- `status_text TEXT`

MVP:

- `username` ist Pflicht fuer oeffentliche Rankings.
- `city` bleibt optional.
- `avatar_url` und `status_text` koennen spaeter kommen.

### 6.3 Erweiterung `challenges`

Neue Felder:

- `type TEXT NOT NULL DEFAULT 'fixed_duration'`
- `proof_required TEXT NOT NULL DEFAULT 'manual'`
- `metric_type TEXT NOT NULL DEFAULT 'check_in'`
- `is_curated INTEGER NOT NULL DEFAULT 0`

Challenge-Typen:

- `one_shot`
- `fixed_duration`
- `open_duration`
- `progress`
- `team`

MVP nutzt nur:

- `one_shot`
- `fixed_duration`
- `open_duration`

### 6.4 Erweiterung `participations`

Bestehende Felder:

- `id`
- `user_id`
- `challenge_id`
- `started_at`
- `status`
- `completed_at`

Neue optionale/cachebare Felder:

- `current_streak INTEGER NOT NULL DEFAULT 0`
- `longest_streak INTEGER NOT NULL DEFAULT 0`
- `fulfilled_count INTEGER NOT NULL DEFAULT 0`
- `missed_count INTEGER NOT NULL DEFAULT 0`
- `success_rate REAL NOT NULL DEFAULT 0`
- `last_check_in_at TEXT`

Hinweis:

Diese Werte duerfen aus `check_ins` berechnet werden. Cache-Felder sind nur
zulaessig, wenn sie bei jedem Check-in konsistent aktualisiert oder periodisch
neu berechnet werden.

### 6.5 Erweiterung `check_ins`

Bestehende Felder:

- `id`
- `participation_id`
- `date`
- `note`
- `created_at`

Neue Felder:

- `status TEXT NOT NULL DEFAULT 'fulfilled'`
- `value REAL`
- `proof_id TEXT`

Statuswerte:

- `fulfilled`
- `missed`
- `pending`

### 6.6 Neue Tabelle `challenge_invites`

Felder:

- `id TEXT PRIMARY KEY`
- `challenge_id TEXT NOT NULL`
- `inviter_id TEXT NOT NULL`
- `invitee_id TEXT`
- `invite_link_token_hash TEXT UNIQUE`
- `status TEXT NOT NULL DEFAULT 'pending'`
- `created_at TEXT NOT NULL`
- `expires_at TEXT`
- `accepted_at TEXT`

Statuswerte:

- `pending`
- `accepted`
- `declined`
- `expired`

### 6.7 Neue Tabelle `proofs` spaeter

Nicht im ersten technischen MVP.

Felder:

- `id`
- `user_id`
- `participation_id`
- `type`
- `url`
- `status`
- `created_at`

Proof-Status:

- `pending`
- `accepted`
- `rejected`
- `unclear`

### 6.8 Neue Tabelle `proof_votes` spaeter

Nicht im ersten technischen MVP.

Felder:

- `id`
- `proof_id`
- `voter_id`
- `vote`
- `created_at`

Votes:

- `passed`
- `failed`
- `unclear`
- `bad_form`

### 6.9 Neue Tabellen `badges` und `user_badges` spaeter

Nicht im ersten technischen MVP.

## 7. Berechnungslogik

### 7.1 Tage seit Start

`elapsedDays = heute - started_at + 1`

Mindestwert: `1`.

### 7.2 Erfuellte Tage

Anzahl eindeutiger Check-ins mit `status = 'fulfilled'`.

### 7.3 Verpasste Tage

Fuer offene Dauer-Challenges:

`missedDays = elapsedDays - fulfilledDays`

Mindestwert: `0`.

Fuer feste Dauer-Challenges:

`missedDays = min(durationDays, elapsedDays) - fulfilledDays`

### 7.4 Erfuellungsquote

Offene Dauer-Challenge:

`successRate = fulfilledDays / elapsedDays`

Feste Dauer-Challenge:

`successRate = fulfilledDays / durationDays`

Anzeige als Prozent, gerundet auf ganze Prozent.

### 7.5 Aktuelle Serie

Rueckwaerts ab heute zaehlen, solange fuer jeden Tag ein `fulfilled`-Check-in
existiert.

Wenn heute noch nicht eingecheckt wurde, kann je nach Produktentscheidung:

- Serie bis gestern angezeigt werden, mit Hinweis `Heute offen`, oder
- Serie als `0` gelten.

MVP-Entscheidung:

Serie wird bis gestern weitergezaehlt, wenn heute noch offen ist. Die UI zeigt
`Heute offen`.

### 7.6 Laengste Serie

Laengste zusammenhaengende Folge von `fulfilled`-Check-ins.

### 7.7 Ranking offene Dauer-Challenge

Sortierung:

1. aktuelle Serie absteigend
2. Erfuellungsquote absteigend
3. erfuellte Tage absteigend
4. Startdatum aufsteigend

### 7.8 Ranking feste Dauer-Challenge

Sortierung:

1. Status `completed`
2. Erfuellungsquote absteigend
3. erfuellte Tage absteigend
4. laengste Serie absteigend
5. Abbruchtag absteigend

### 7.9 Ranking One-Shot

Erst spaeter vollstaendig.

MVP-Regel:

- bestanden vor nicht bestanden
- Proof-Status sichtbar, sobald Proofs existieren
- ohne Proof nur `unverified`

## 8. Server Actions und Datenzugriff

Alle mutationsrelevanten Funktionen laufen serverseitig.

### 8.1 Challenge starten

Server Action:

- `startChallenge(challengeSlug)`

Verhalten:

- Nutzer muss eingeloggt sein.
- Challenge wird ueber Slug gefunden.
- Falls Teilnahme schon existiert, keine Duplikate erzeugen.
- Neue `participations`-Zeile anlegen.
- Redirect in Challenge-Raum oder Rueckgabe der Raum-URL.

Akzeptanz:

- Reload verliert Teilnahme nicht.
- Teilnahme erscheint in `/meine-challenges`.
- Ranking kann Teilnahme lesen.

### 8.2 Check-in setzen

Server Action:

- `setCheckIn(participationId, date, status, note?)`

Verhalten:

- Nutzer muss Besitzer der Teilnahme sein.
- Pro Teilnahme und Datum nur ein Check-in.
- Wiederholter Check-in aktualisiert Status/Notiz.
- Rankingwerte werden berechnet oder Cache-Felder aktualisiert.

Akzeptanz:

- Heute kann als erfuellt markiert werden.
- Nach Reload ist Check-in sichtbar.
- Streak und Quote aktualisieren sich.

### 8.3 Check-in entfernen oder als verpasst setzen

MVP:

- `missed` ist erlaubt.
- Loeschen nur fuer eigene Check-ins.

### 8.4 Einladung erzeugen

Server Action:

- `createChallengeInvite(challengeSlug | participationId)`

Verhalten:

- Nutzer muss eingeloggt sein.
- Token wird nur gehasht gespeichert.
- Sharebarer Link wird angezeigt.

### 8.5 Einladung annehmen

Route:

- `/einladung/[token]`

Verhalten:

- Wenn nicht eingeloggt: Login mit `next`.
- Token pruefen.
- Teilnahme erzeugen.
- Invite auf `accepted` setzen.
- In gemeinsamen Challenge-Raum weiterleiten.

## 9. UI-Screens und Komponenten

### 9.1 Challenge-Detailseite

Pflichtkomponenten:

- `ChallengeHero`
- `ChallengeStartButton`
- `ChallengeRankingPreview`
- `ChallengeStatsBand`
- `ChallengeMatePanel`
- `ChallengeRules`
- `ChallengeSeoContent`

Wichtig:

- Fokus vor Start: Starten, Ranking, Mate, Aktivitaet.
- SEO-Text bleibt am Ende.
- Dashboard-Funktionen bleiben ausserhalb.

### 9.2 Meine Challenges

Pflichtkomponenten:

- Liste aktiver Challenges.
- Check-in heute.
- Streak.
- Erfuellungsquote.
- Link zum Challenge-Raum.
- Status aktiv/abgeschlossen/abgebrochen.

### 9.3 Challenge-Raum

Pflichtkomponenten:

- Raumkopf mit Challenge, Status und Startdatum.
- Heute-Check-in.
- Eigene Kennzahlen.
- Ranking-Tabelle.
- Teilnehmerliste.
- Aktivitaetsfeed.
- Einladungslink.

### 9.4 Ranking-Seite

Pflichtkomponenten:

- Tab/Segment: Gesamt, Challenge, Streaks, Quote, Newcomer.
- Filter nach Challenge.
- Ranking-Tabelle.
- Leerer Zustand ohne Fake-Daten.
- Link zur jeweiligen Challenge.

### 9.5 Profilseite

Pflichtkomponenten:

- Nutzerkopf.
- Aktive Challenges.
- Abgeschlossene Challenges.
- Kennzahlen.
- Ranglistenpositionen.

## 10. Erster technischer Build-Slice

### 10.1 Ziel

Die offene Dauer-Challenge `Ab heute jeden Tag 30 Minuten lesen` ist mit echten
serverseitigen Daten nutzbar.

### 10.2 Enthalten

- Kuratierte Challenge mit Typ `open_duration`.
- Challenge starten per Server Action.
- Teilnahme in SQLite speichern.
- `/meine-challenges` liest serverseitige Teilnahmen.
- Challenge-Raum fuer Teilnahme.
- Heute einchecken.
- Streak, erfuellte Tage, verpasste Tage, Quote berechnen.
- Ranking fuer diese Challenge.
- Detailseite zeigt echte Teilnehmerzahl und Ranking-Vorschau.

### 10.3 Nicht enthalten

- Proof-Upload.
- Freund herausfordern.
- Badges.
- Profilseite ausser minimalem Account-Kontext.
- Stadt.
- Team-Challenges.

### 10.4 Akzeptanzkriterien

- Eingeloggter Nutzer kann `30 Minuten lesen` starten.
- Nach Start existiert genau eine Teilnahme in `participations`.
- Nutzer landet im Challenge-Raum oder kann ihn direkt aufrufen.
- Nutzer kann fuer heute `erfuellt` setzen.
- Check-in wird in `check_ins` gespeichert.
- Nach Reload bleibt Check-in sichtbar.
- Quote wird korrekt berechnet.
- Aktuelle Serie wird korrekt berechnet.
- Ranking zeigt den Nutzer mit echten Werten.
- `/meine-challenges` zeigt aktive Challenge mit Link zum Raum.
- Kein LocalStorage ist fuer diesen Flow noetig.
- Playwright-Smoke-Test deckt Start, Check-in, Reload und Ranking ab.

## 11. Zweiter technischer Build-Slice

### 11.1 Ziel

Ein Nutzer kann einen Freund per Link zur gleichen Challenge einladen.

### 11.2 Enthalten

- `challenge_invites`-Tabelle.
- Einladungslink im Challenge-Raum.
- Einladung annehmen.
- Eingeladener Nutzer startet gleiche Challenge.
- Beide erscheinen im Ranking.
- Raum zeigt Teilnehmerliste.

### 11.3 Akzeptanzkriterien

- Nutzer A erzeugt Link.
- Nutzer B oeffnet Link.
- Wenn B nicht eingeloggt ist, wird Login/Registrierung angeboten.
- Nach Annahme wird Teilnahme fuer B erzeugt.
- A und B erscheinen im Ranking derselben Challenge.

## 12. Dritter technischer Build-Slice

### 12.1 Ziel

Proofs fuer Challenges einfuehren, ohne das Produkt in einen Social Feed zu
verwandeln.

### 12.2 Enthalten

- Proof-Modell.
- Proof-Upload oder Video-Link.
- Proof-Status.
- Community-Bewertung:
  - bestanden
  - nicht bestanden
  - unklar
  - Form unsauber
- Proof-Status sichtbar im Ranking.

### 12.3 Akzeptanzkriterien

- Nutzer kann Proof zu Check-in oder One-Shot-Versuch hinterlegen.
- Andere Nutzer koennen bewerten.
- Proof-Status wird berechnet.
- Ranking zeigt Proof-Status transparent.

## 13. Migration vom aktuellen Zustand

### 13.1 Lokaler Teilnahme-MVP

Der LocalStorage-Flow bleibt kurzfristig als Fallback, wird aber fuer echte
MVP-Flows ersetzt.

Migrationsziel:

- Neue serverseitige Teilnahme fuer eingeloggte Nutzer.
- Optional spaeter: lokaler Gastfortschritt kann beim Login importiert werden.

### 13.2 Kuratierte statische Challenges

Aktuell liegen viele Challenges in `data/challenges.ts`.

Migrationsziel:

- Kuratierte Start-Challenges koennen weiter statisch definiert sein.
- Fuer Teilnahme/Ranking wird eine interne Challenge-ID benoetigt.
- Entweder statische Challenges werden beim DB-Start gespiegelt, oder DB-Helper
  koennen statische und DB-Challenges einheitlich aufloesen.

MVP-Entscheidung:

- Fuer den ersten Slice wird eine DB-kompatible kuratierte Challenge-Aufloesung
  gebaut, damit `participations.challenge_id` immer auf einen stabilen
  Challenge-Datensatz zeigt.

## 14. Tests und Verifikation

### 14.1 Unit-Tests

Fuer Berechnungen:

- Tage seit Start.
- Erfuellte/verpasste Tage.
- Erfuellungsquote.
- Aktuelle Serie.
- Laengste Serie.
- Ranking-Sortierung.

Falls kein Test-Runner vorhanden ist, wird entweder ein schlanker Node-Test
eingefuehrt oder die Logik wird zunaechst ueber isolierte Script-/Build-Checks
verifiziert.

### 14.2 Playwright-Smoke-Tests

Pflichtflows:

- Registrieren/Login.
- Challenge starten.
- Check-in setzen.
- Reload.
- Ranking pruefen.
- `/meine-challenges` pruefen.
- Challenge-Raum pruefen.
- Mobile und Desktop.

### 14.3 Build-Checks

- `npm run lint`.
- `npm run build`.

## 15. Nicht-funktionale Anforderungen

### 15.1 Mobile-first

Alle Kernflows muessen auf 390px Breite funktionieren:

- Starten.
- Check-in.
- Ranking lesen.
- Einladung teilen.

### 15.2 Performance

Kernseiten sollen serverseitig schnell rendern.

MVP-Ziel:

- Keine schweren Client-Bundles fuer reine Tabellen.
- Client-Komponenten nur fuer echte Interaktion.

### 15.3 Glaubwuerdigkeit

Keine Fake-Namen.
Keine Fake-Rankings.
Keine Fake-Aktivitaeten.

Leere Zustaende sind erlaubt und sollen produktiv formuliert sein.

### 15.4 Sicherheit

MVP-Mindestanforderungen:

- Server Actions pruefen aktuellen Nutzer.
- Teilnahme/Check-in nur fuer eigene Daten mutierbar.
- Invite-Tokens werden gehasht gespeichert.
- Keine Secrets im Client.
- Session-Cookies bleiben `httpOnly`.

Spaeter:

- Rate Limits fuer Auth und Einladungen.
- E-Mail-Verifikation.
- Melden-Funktion.

## 16. Offene Produktentscheidungen

Vor oder waehrend Slice 1 entscheiden:

1. Exakte erste Challenge: `30 Minuten lesen` bestaetigen oder `10.000 Schritte`.
2. Soll `Challenge starten` ohne Login erlaubt sein oder immer Login erfordern?
3. Wie wird `Heute offen` bei Streaks angezeigt?
4. Werden verpasste Tage explizit gespeichert oder berechnet?
5. Wird `abgebrochen` manuell gesetzt oder automatisch nach Inaktivitaet?
6. Welche Begriffe nutzt die UI: `erfuellt`, `geliefert`, `check-in`,
   `durchgezogen`?

Empfehlung:

- Fuer den ersten Server-MVP Login verlangen.
- Verpasste Tage berechnen, nicht taeglich speichern.
- UI-Begriff: `Heute geliefert` fuer Button, `Check-in` als technischer
  Sekundaerbegriff.

## 17. Roadmap

### Phase A: Fundament finalisieren

- Dieses Pflichtenheft freigeben.
- Start-Challenge festlegen.
- Rankinglogik final bestaetigen.

### Phase B: Server-MVP Dauer-Challenge

- Datenmodell erweitern.
- Challenge-Start serverseitig.
- Check-in serverseitig.
- Challenge-Raum.
- Ranking.
- `/meine-challenges` serverseitig.

### Phase C: Einladungslink

- Invite-Modell.
- Link erzeugen.
- Link annehmen.
- Gemeinsamer Raum.

### Phase D: Proof

- Proof-Modell.
- Proof-UI.
- Community-Bewertung.
- Proof-Status im Ranking.

### Phase E: Profil und Anerkennung

- Profilseite.
- Badges.
- Ranglistenpositionen.

### Phase F: Teams und lokale Gruppen

- Team-Challenges.
- Stadtgruppen.
- Stadt-/Event-Rankings.

## 18. Definition of Done fuer MVP-Slice 1

Der Slice gilt als fertig, wenn:

- ein realer eingeloggter Nutzer ohne Entwicklerhilfe eine Dauer-Challenge
  starten kann,
- Check-ins serverseitig gespeichert werden,
- Streak und Quote korrekt berechnet werden,
- Ranking aus echten Daten entsteht,
- Challenge-Raum als Arbeitsflaeche existiert,
- `/meine-challenges` den serverseitigen Stand zeigt,
- Desktop und Mobile per Browser geprueft sind,
- `npm run lint` und `npm run build` erfolgreich laufen,
- keine Fake-Daten fuer Ranking oder Aktivitaet angezeigt werden.
