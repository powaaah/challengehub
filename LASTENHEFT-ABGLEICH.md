# Abgleich Lastenheft ChallengeHub

**Verglichene Grundlagen**

- bestehend: `challengehub-lastenheft.md` (v0.1, MVP- und Ausbaustrategie)
- neu: `.hermes/desktop-attachments/Lastenheft ChallengeHub.md` (v1.0, Stand 22. Juli 2026)
- Ist-Stand: aktueller Next.js-Code, `TODOS.md`, PostgreSQL-Migrationen und vorhandene Tests

## 1. Kurzfazit

Das neue Lastenheft ist deutlich vollständiger und präziser als das bestehende Dokument. Es eignet sich als langfristiges fachliches Zielbild, sollte das bestehende Lastenheft aber nicht unverändert ersetzen.

Der wichtigste Grund: Beide Dokumente definieren den MVP unterschiedlich.

- Das bestehende Dokument verlangt bewusst einen kleinen Kern aus Challenge, Check-in, sozialer Verbindlichkeit, Einladung und Ranking.
- Das neue Dokument bezeichnet zusätzlich private Challenges, Video-Uploads, Admin-Prüfung, Passwort-Reset, Benachrichtigungen und weitere große Bereiche als Muss-Anforderungen des MVP.

Würde die neue Muss-Liste ungefiltert zur unmittelbaren Roadmap, wäre der bisher bewusst kleine vertikale Entwicklungsansatz aufgehoben. Empfohlen wird deshalb:

1. das neue Lastenheft als fachliches Zielbild zu übernehmen,
2. die Produktprinzipien und die enge Release-Strategie aus v0.1 beizubehalten,
3. den tatsächlichen Release-1-Umfang im Pflichtenheft und in `TODOS.md` separat festzulegen.

### Quantifizierter Ist-Abgleich gegen Kapitel 38

| Priorität | Erfüllt | Teilweise | Offen |
|---|---:|---:|---:|
| Muss (21) | 3 | 12 | 6 |
| Soll (8) | 0 | 1 | 7 |
| Kann (10) | 0 | 0 | 10 |

Damit ist ein belastbarer Dauer-Challenge-Kern vorhanden, die in Kapitel 41
definierte erste Version ist fachlich aber noch nicht abnahmefähig.

## 2. Gemeinsamkeiten

Beide Dokumente stimmen in den zentralen Produktprinzipien überein:

- Challenges entdecken, starten und gemeinsam oder gegeneinander absolvieren
- soziale Motivation statt rein privatem Habit-Tracking
- Fortschritt, Streaks und Erfolgsquoten sichtbar machen
- Rankings als zentralen Produktbestandteil behandeln
- Freunde beziehungsweise Challenge-Partner einladen oder finden
- öffentliche, SEO-fähige Challenge-Seiten bereitstellen
- Proofs beziehungsweise Nachweise für glaubwürdige Leistungen vorsehen
- responsive Website zuerst, mobile Apps später
- langfristige Erweiterbarkeit für Teams, Unternehmen und Regionen

## 3. Fachliche Unterschiede und Konflikte

| Thema | Bestehendes Lastenheft v0.1 | Neues Lastenheft v1.0 | Bewertung |
|---|---|---|---|
| Produktkern | Soziale Verbindlichkeit, gemeinsames Durchziehen und Freund herausfordern | Wettbewerb, Vergleichbarkeit, direkte Konkurrenz und verifizierte Leistung | Ergänzbar, aber Priorität muss festgelegt werden |
| Primäre Zielgruppe | Menschen, die allein nicht konstant bleiben; Anfänger und Accountability-Suchende | vor allem leistungs- und wettbewerbsorientierte Männer 20–40, Unternehmer und Sportinteressierte | deutliche Positionierungsverschiebung |
| MVP-Größe | bewusst klein: Profil, wenige Challenge-Typen, Check-ins, Ranking, Einladung | sehr groß: zusätzlich private Challenges, Video, Admin-Prüfung, Passwort-Reset, Benachrichtigungen, Highscores und mehr | größter Widerspruch |
| Challenge-Typen | One-Shot, feste Dauer, offene Dauer, Fortschritt, Team, Stadt/Event | einmalig, dauerhaft, zeitraumbezogen, Wettkampf; Typ und Klasse getrennt | v1.0 ist technisch sauberer, Fortschritt muss als Wertungsart oder eigener Typ geklärt werden |
| Challenge-Klassen | nicht konsequent von Typen getrennt | Nutzer, Beginner, Fortgeschritten, Premium | v1.0 sollte übernommen werden |
| Proof-System | einfache Community-Bewertung bereits früh | Video für Wettkampf, Admin-Verifizierung; Community-Prüfung später | v1.0 ist kontrollierter, aber erheblich aufwendiger |
| Challenge-Mate | sozialer Kern, Freund herausfordern und gemeinsamer Raum früh | strikt an eine konkrete Challenge und Teilnahme gebunden | v1.0 präzisiert den Zugriff sinnvoll |
| Ranking | mehrere motivierende Rankings, Comeback und Verbesserung | absolute/relative Wertung, 100-Tage-Mindestbasis, Top 20 plus direkte Nachbarn | v1.0 ist abnahmefähiger; Comeback/Verbesserung sollte nicht verloren gehen |
| Startseite | zusätzlich Top-Challenges und Rankings | ausschließlich Header, Hero, Social Links und Footer | klare Designentscheidung erforderlich |
| Mobile | native App bewusst später | PWA, iOS und Android ausdrücklich als Ausbauziel; Daten und Schnittstellen darauf vorbereiten | passt zur aktuellen API-/Repository-Strategie |
| SEO | vorhanden, aber weniger formal | eigene verbindliche SEO-Anforderungen | v1.0 übernehmen |
| Datenschutz/Admin | eher allgemein | Rollen, DSGVO, Moderation, Einspruch und Löschung konkret | v1.0 übernehmen, aber stufenweise umsetzen |

## 4. Abgleich mit dem aktuellen Code

### 4.1 Bereits erfüllt oder belastbar vorbereitet

- responsive Next.js-Webanwendung mit App Router
- öffentliche Start-, Katalog- und Challenge-Detailseiten
- sprechende Challenge-URLs
- serverseitige Metadata, Canonicals und strukturierte Daten
- `robots.txt` und dynamische Sitemap
- Login, Registrierung und Logout mit serverseitiger Session
- Registrierung mit Benutzername, E-Mail-Adresse und Passwort im gemeinsamen Popup
- Login-/Registrierungsdialog beim Header und bei `Jetzt teilnehmen`
- öffentliche Challenge-Erstellung mit Accountbindung
- serverseitige Teilnahme an der ersten Dauer-Challenge
- täglicher Check-in
- Berechnung von erfüllten/verpassten Tagen, aktuellem/längstem Streak und Quote
- echtes Challenge-Ranking aus serverseitigen Daten
- persönliches Dashboard und Challenge-Raum
- sichere, zeitlich begrenzte und widerrufbare Einladungslinks
- versionierte öffentliche Read-API unter `/api/v1/challenges`
- Repository-Grenzen und PostgreSQL-Migrationsgrundlage für Mobile-/Skalierungsfähigkeit
- Challenge verlassen mit Sicherheitsabfrage, archiviertem Verlauf und
  serverseitiger Sperre weiterer Check-ins und Einladungen
- Passwort-Reset mit neutraler Anfrage, gehashtem 30-Minuten-Einmal-Token,
  sicherer Passwortänderung und Beendigung aller bestehenden Sitzungen; der
  produktive E-Mail-Versand benötigt noch die Resend-Konfiguration

### 4.2 Teilweise erfüllt

| Anforderung v1.0 | Ist-Stand | Lücke |
|---|---|---|
| eindeutiger Benutzername | Feld `name` vorhanden | kein Unique-Constraint und keine Benutzername-Suche im Login |
| Login mit E-Mail oder Benutzername | E-Mail-Login vorhanden | Benutzername-Login fehlt |
| Challenge-Typ und Challenge-Klasse getrennt | Klasse/Level vorhanden | kein vollständiges erstes Domainmodell für Typ, Wertungsart und Nachweisregel |
| Teilnahme nach Login fortsetzen | Rücksprungpfad zur Challenge vorhanden | automatische Fortsetzung und eigene Bestätigungsseite fehlen |
| Ranking | Top 10, Streak und Quote vorhanden | Top 20 plus Nachbarpositionen, absolute Erreichung und 100-Tage-Regel fehlen |
| Challenge erstellen | serverseitiges Formular und Vorschau vorhanden | kein mehrstufiger typabhängiger Assistent, keine private Sichtbarkeit, keine Nachweisregel; außerdem können normale Nutzer derzeit auch offizielle Klassen wie Premium auswählen |
| Challenge-Mate | geschützte vorbereitete Route vorhanden | Profilkriterien, Suchpool, Matching und Anfragen fehlen |
| PostgreSQL | Migration und erster Adapter vorhanden | Runtime verwendet weiterhin SQLite |
| Mobile-API | öffentliche Read-API vorhanden | Auth-, Teilnahme-, Check-in-, Profil- und Einladungs-API fehlen |
| SEO-Inhalte | Grundstruktur vorhanden | finale Texte, interne Verlinkung und Social-Preview-Bilder fehlen |

### 4.3 Offen

- eigene Bestätigungsseite nach erfolgreicher Teilnahme
- Profilverwaltung, Avatar, Ort, Alter, Geschlecht und Sichtbarkeit
- private Challenges und Challenge-Administratorrechte
- E-Mail-Einladungen
- Challenge-Mate-Suche und Anfrageverwaltung
- Benachrichtigungszentrum
- Bild- und Video-Nachweise
- Admin-Prüfung, Moderation und Einsprüche
- Wettkampf-Wertungsarten und verifizierte Highscores
- Bewertungen
- Premium-System
- zentrale differenzierte Ranking-Seite
- DSGVO-Datenexport, Kontolöschung und Einwilligungsverwaltung
- PWA sowie iOS-/Android-Clients

## 5. Konkrete Abweichungen, die vor Weiterarbeit entschieden werden sollten

### 5.1 Challenge-Titel

Das neue Lastenheft verlangt:

- gespeicherter beziehungsweise auf Karten sichtbarer Titel: `10.000 Schritte am Tag`
- Detailseiten-H1: `10.000 Schritte am Tag Challenge`
- `Challenge` wird systemseitig ergänzt

Der aktuelle kuratierte Datensatz enthält hingegen bereits `10 000 Schritte am Tag Challenge`. Damit erscheint `Challenge` potenziell auch im Katalog und in API-Daten. Zusätzlich hat Stefan für die sichtbare H1 ausdrücklich die Schreibweise `10 000` statt `10.000` festgelegt.

Empfehlung: Domain-Titel und Anzeige-Titel trennen. Der Domain-Titel bleibt ohne Suffix; Detailseite ergänzt `Challenge`. Die gewünschte Zahlenschreibweise muss als bewusste ChallengeHub-Konvention festgelegt werden.

### 5.2 Teilnahme-CTA

Das neue Lastenheft nennt `An Challenge teilnehmen`, der aktuelle Stand verwendet `Jetzt teilnehmen`. Funktional ist der Ablauf inzwischen korrekt; die Beschriftung ist eine offene Copy-Entscheidung.

### 5.3 Teilnahme nach Authentifizierung

Der aktuelle Dialog bewahrt den Rücksprungpfad. Das neue Lastenheft verlangt darüber hinaus, dass die beabsichtigte Teilnahme nach erfolgreichem Login fortgesetzt und anschließend eine messbare Bestätigungsseite geöffnet wird. Dafür braucht es eine sichere serverseitige Teilnahmeabsicht statt nur eines `next`-Pfads.

### 5.4 MVP-Abgrenzung

Die Muss-Liste aus Kapitel 38 der v1.0 entspricht eher einem vollständigen ersten Produktrelease als einem kleinen MVP. Sie sollte in mindestens drei Releases getrennt werden:

- **Release 1 – Kernloop:** Auth, öffentliche Dauer-Challenge, Teilnahme, Check-in, Dashboard, Ranking, Einladung
- **Release 2 – Community:** Profil, Challenge-Mate, private Challenges, Anfragen, Benachrichtigungen
- **Release 3 – Verifizierung:** Uploads, Wettkampf, Admin-Prüfung, Einspruch, Premium-Rankings

## 6. Empfohlene nächsten Slices

1. Domainmodell für `ChallengeType`, `ChallengeClass`, `ScoringType`, `Visibility` und `ProofRequirement` festlegen.
2. Challenge-Titel ohne Darstellungs-Suffix speichern und `Challenge` nur auf Detailseiten ergänzen.
3. Benutzername eindeutig machen und Login per E-Mail oder Benutzername ermöglichen.
4. Passwort-Reset mit gehashtem, kurzlebigem Einmal-Token umsetzen.
5. Teilnahmeabsicht über Login hinweg sichern, Teilnahme automatisch abschließen und Bestätigungsseite bereitstellen.
6. `Challenge verlassen` mit Sicherheitsabfrage und klarer Statushistorie ergänzen. **Umgesetzt.**
7. Ranking auf absolute/relative Erreichung, 100-Tage-Mindestbasis sowie Top 20 plus direkte Nachbarn erweitern.
8. Profilgrundlage für Avatar, groben Ort und Challenge-Mate-Sichtbarkeit schaffen.
9. Private Challenge als kleinen End-to-End-Slice mit Sichtbarkeit und Einladungslink umsetzen.
10. Erst danach Upload-/Wettkampf-/Admin-Verifizierung als separaten vertikalen Ausbau beginnen.

## 7. Empfehlung zur Dokumentführung

- `challengehub-lastenheft.md`: nach Freigabe als kanonisches fachliches Zielbild auf Basis der v1.0 neu fassen
- `challengehub-pflichtenheft.md`: technische Umsetzung, aktuelle Release-Grenze und Abnahmekriterien
- `TODOS.md`: ausschließlich priorisierte, kleine und verifizierbare Umsetzungsslices
- altes v0.1-Dokument: nicht löschen, sondern als Produktstrategie beziehungsweise Archiv erhalten

Vor einer Ersetzung des bestehenden Lastenhefts sollten insbesondere Positionierung, MVP-Grenze, Titelkonvention und Verifizierungsumfang ausdrücklich freigegeben werden.
