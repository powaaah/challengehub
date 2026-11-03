# ADR: ChallengeHub Mobile als eigenständige Expo-App

Datum: 2026-11-03. Bezug: Issue #12. Status: Grundgerüst umgesetzt;
Daten-/API-Erweiterungen unten sind Entwürfe, keine implementierten Endpunkte.
Der aktuelle Nutzerauftrag autorisiert das Grundgerüst trotz des ursprünglichen
Planungsstatus des Issues. Produktion und Deployment sind nicht freigegeben.

## Bestandsaufnahme vor Implementierung

- Website: Next.js 16.2.12 App Router, React 19.2.1, TypeScript, eigene Komponenten.
  `package.json` enthält Node-Tests, ESLint und Playwright. Kein Workspace-Manager.
- Domain: `domain/challenges/challenge-definition.ts` beschreibt `daily_boolean`,
  `cumulative_metric`, `one_time_result`. `challenge-outcome.ts` berechnet Tage,
  Summen bzw. Bestwerte mit `at_least`/`at_most`. Die Funktion filtert keinen
  Battle-Zeitraum; ein neuer Anwendungsdienst muss das vor der Wertung tun.
  `completion-result.ts`, Journey- und Navy-Regeln erfordern eigene Eignungsprüfung.
- Persistenz: `lib/accounts.ts`, `lib/challenge-invitations.ts` und weitere Dienste
  verwenden SQLite-Adapter aus `infrastructure/sqlite`. PostgreSQL-Adapter und
  Migrationen sind vorbereitet, aber das ist keine freigegebene Runtime-Umschaltung.
- Inhalte: kuratierte Challenges in `content/challenges`, generierte Daten in
  `data/challenges.generated.ts`; Community-Challenges kommen aus der Datenbank.
  Es wird kein zweiter Mobile-Katalog angelegt.
- Öffentliche API: `app/api/v1/challenges/route.ts` und `[slug]/route.ts` liefern
  validierte Katalogdaten, Cursor-Pagination und Detailansichten. Der vorhandene
  `clients/public-challenge-api-client.ts` validiert Antworten und unterstützt
  Abbruchsignale. Er ist ein Kandidat für spätere gemeinsame Nutzung; der
  Server-DTO-Code verwendet auch Node `Buffer` und darf nicht als Runtime-Modul
  in die native App gelangen. Rankingdaten sind nicht Teil dieses Katalogvertrags.
- Auth: `app/auth/actions.ts` nutzt Server Actions, bestehende Accounts,
  Rate-Limits und E-Mail-Verifikation. `lib/auth.ts` setzt ein HttpOnly-/SameSite-
  Cookie, speichert nur den SHA-256-Hash des zufälligen Sessiontokens und prüft
  dessen Ablauf. Das ist noch kein nativer Login-/Refresh-/Logout-API-Vertrag.
- Einladungen: `lib/challenge-invitations.ts` erstellt gehashte, sieben Tage gültige
  Tokens. `domain/invitations/challenge-invitation-repository.ts` bindet Einladungen
  an Teilnahmen. Annahme erzeugt eine Teilnahme, keine private Battle-Mitgliedschaft.
  Bestehende Einladungslinks dürfen durch Mobile nicht umgedeutet werden.
- Profile/Privacy: Account-/Export-/Löschgrenzen und ChallengeMate existieren.
  Öffentliche Teilnahme-Statistiken und Rankings sind keine Zugriffskontrolle für
  private Battles. Körpermesswerte und Bilder bleiben außerhalb der Battle-DTOs.
- Build/Deployment: `scripts/challenge-runtime.mts` kompiliert Inhalte beim Build;
  `start` prüft den Fingerabdruck und synchronisiert SQLite. Keine Ausführung
  gegen Produktionsdaten. Der dokumentierte VPS-Release ist ein eigener,
  ausdrücklich freizugebender Vorgang; dieser PR führt ihn nicht aus.

## Entscheidung und aktueller Umfang

`apps/mobile` ist eine eigenständig installierbare Expo-/React-Native-App für iOS
und Android mit eigenem Lockfile. Die Web-App bleibt am Repository-Root.
Bewusst noch keine npm-Workspace-Konvertierung: Root-Lockfile, Web-React-Version,
Inhaltscompiler und Deployment-Kommandos behalten ihre bisherigen Grenzen.
Root-TypeScript und Root-ESLint schließen die Mobile-App aus; Mobile hat eigene
Prüfkommandos. Eine spätere Workspace-/Shared-Package-Extraktion ist separat zu
prüfen, insbesondere React-Deduplizierung und Metro-Auflösung.

Start: drei gleich große Pressables in einer horizontalen Reihe, ohne fixierte
Texthöhen oder deaktivierte Schriftvergrößerung. Safe Areas, Scrollen, dunkles
Theme, deutsche Accessibility-Labels, sichtbare Zurück-Navigation und Android-
Hardware-Zurück. Tim erhält den direkten Wettstreit-Einstieg, Stefan und Matthias
den Gruppeneinstieg. Global trägt exakt „Miss dich mit den Besten der Welt.“

### Aktualisierung: Gast-Katalog (2026-11-03)

Nutzerentscheidung: zuerst alle Abläufe ohne Login entwickeln. Die frühere
Auth-zuerst-Reihenfolge unten ist damit überholt; Login-Gates werden erst später
gezielt entschieden. Private Gast-Battles benötigen weiterhin serverseitige
Autorisierung über einen geschützten Gastzugang, bevor Schreibwege entstehen.

Der erste funktionale Slice lädt den bestehenden öffentlichen Katalog über den
geteilten v1-Client: Modi → paginierter Katalog → Ziele/Regeln/Tipps → zurück.
Keine Anmeldung, Session, neue Datenbank oder Kopie des Katalogs. DTO-Typen sind
in ein serverunabhängiges Modul ausgelagert, bisherige Exporte bleiben kompatibel.
Native Requests verwenden HTTPS und `credentials: omit`; auf Web verwenden der
lokale Vorschau- und Metro-Server einen auf Katalog-GETs begrenzten Proxy. Keine
Produktions-CORS-Änderung. Aktiver öffentlicher API-Host ist `theovina.de`, während
die kanonische Domain beim Prüfen 404 für diese API lieferte. Fehler und Timeouts
sind sichtbar und wiederholbar; ein späterer Hostwechsel erfolgt konfiguriert.

Die lokalen Proxys übertragen keine Cookies oder Authorization-Header, erlauben
keine Schreibmethoden und folgen keinen Redirects. Nur die öffentlichen
Katalogdaten werden gelesen. Globale Rankings und private Battle-Ergebnisse
sind weiterhin nicht implementiert.

## Vorgeschlagenes additives Datenmodell (nächster Slice)

Alle IDs serverseitig erzeugen, Zeiten als UTC speichern, Fremdschlüssel auf
bestehende Accounts/Challenges. Kein Kopieren bestehender Accountdaten.

| Tabelle | Wesentliche Felder und Bedingungen |
| --- | --- |
| battles | id, challenge_id, owner_user_id, kind (`duel`/`group`), status (`lobby`/`active`/`completed`/`cancelled`), starts_at, ends_at, timezone, rules_snapshot, scoring_version, revision; ends_at > starts_at |
| battle_members | battle_id + user_id eindeutig, joined_at, role; Start nur mit genau 2 bzw. 3–20 bestätigten Konten; danach Teilnehmerliste unveränderlich |
| battle_invites | id, battle_id, inviter_user_id, token_hash eindeutig, expires_at, accepted_by, accepted_at, revoked_at; Annahme und Kapazitätsprüfung atomar |
| battle_check_ins | id, battle_id, user_id, occurred_at, received_at, value, local_day, idempotency_key; eindeutiger Schlüssel pro Mitglied und Request; tägliche Einträge zusätzlich pro lokalem Tag eindeutig |
| battle_results | battle_id + user_id eindeutig, value, completed, rank, scoring_version, finalized_at; nur serverseitig erzeugt, Gleichstand mit gleichem Rang |

Lobby → active nur durch berechtigten Owner, mit zulässiger Mitgliederzahl und
fixiertem Regel-/Zeitraum-Snapshot. Lobby → cancelled möglich. Active → completed
nach Ende durch idempotente Finalisierung. Mitgliedschaft und Zustand bei jedem
Lesen/Schreiben serverseitig prüfen; Kontolöschung/Abbruchregeln vor Migration
festlegen. Messwerte nur für [starts_at, ends_at) zulassen. Tageswertung über die
fixierte Battle-Zeitzone, keine Gerätezeit als alleinige Autorität. Keine alten
Global-Check-ins automatisch übernehmen; keine Battle-Ergebnisse in globale
Rankings schreiben. Spezial-Challenges zunächst ausschließen, bis Regeln passen.

## Vorgeschlagener API-Vertrag (noch nicht implementiert)

HTTPS, versionierte JSON-Envelopes, serverseitige Validierung und Rate-Limits.
Private Antworten `Cache-Control: no-store`, keine Tokens in Logs/Analytics.

| Route | Verhalten |
| --- | --- |
| POST /api/v1/auth/sessions | Bestehende Login-Prüfung verwenden, native widerrufbare Session ausstellen; keine zweite Nutzerverwaltung |
| GET /api/v1/me, DELETE /api/v1/auth/session | Session prüfen bzw. widerrufen; Ablauf/Widerruf auf Client und Server behandeln |
| GET /api/v1/challenges[/:slug] | Vorhandenen öffentlichen Vertrag nutzen |
| GET /api/v1/challenges/:slug/ranking | Neuer öffentlicher, paginierter Privacy-konformer Rankingvertrag |
| POST /api/v1/battles | Challenge, kind, Zeitraum; verifiziertes Konto, serverseitiger Snapshot |
| GET /api/v1/battles/:id | Nur Mitglieder; Außenstehende erhalten keine privaten Daten |
| POST /api/v1/battles/:id/invites | Nur berechtigte Mitglieder, begrenzte Laufzeit und widerrufbares Token |
| POST /api/v1/battle-invites/accept | Token im Body; atomare Mitgliedschaft/Kapazität; Wiederholung durch denselben Nutzer idempotent |
| POST /api/v1/battles/:id/start | Revision/Status und Mitgliederzahl atomar prüfen |
| POST /api/v1/battles/:id/check-ins | Mitgliedschaft, Zeitraum, Messwert und Idempotency-Key prüfen |
| GET /api/v1/battles/:id/results | Nur Mitglieder; vor Abschluss expliziter Zwischenstatus |

Native Session-Tokens gehören in SecureStore, nie AsyncStorage. Bearer-Auth für
native Requests ausdrücklich implementieren und testen; bestehende Web-Cookie-
und Same-Origin-Prüfungen nicht lockern. Refresh-Rotation, Widerruf bei Reset/
Löschung sowie Session-Lebensdauer vor Auth-Implementierung konkret entscheiden.
Kein Passwortspeichern und keine WebView-Cookie-Übernahme.

## Reihenfolge und Migrationsrisiken

1. Dieses Grundgerüst samt reproduzierbaren Checks und Architekturreview.
2. Gast-Katalog umgesetzt. Als Nächstes geschützte Gast-Battle-Erstellung und
   Einladungsannahme ohne Login; Konto-/Session-API erst bei späterem Bedarf.
3. Additive Battle-Migrationen, Zugriffstests, atomare Einladungen und Grenzen
   2/3/20/21, parallele Annahme, Zeitgrenzen, Idempotenz und Gleichstand testen.
4. Erstellen → Einladung → Raum → Check-in → Ergebnis → Revanche vollständig.
5. Global-Rankings mit bestehender Privacy und getrennten Ergebnissen anbinden.
6. Universal/App Links, Push und Deferred Links erst mit verifizierten Domains,
   Geräteprüfung nach Neuinstallation und explizitem Release-Auftrag.

Vor DB-Release: Migration auf Kopie, Backup-/Rollback-Probe, Export/Löschung und
Bestandserhalt prüfen. Keine automatische PostgreSQL-Umschaltung. Signierte
TestFlight-/Play-Builds benötigen eigene IDs, Credentials und Freigabe; lokale
Metro-Exports sind keine installierbaren oder signierten Testbuilds.
