# PostgreSQL-Migrationen

Dieses Verzeichnis ist die versionierte Zielbasis fuer den schrittweisen Wechsel
vom aktuellen SQLite-MVP zu PostgreSQL. Die Anwendung verwendet PostgreSQL noch
nicht; ein Lauf gegen Produktion ist deshalb bewusst nicht automatisiert.

## Konvention

- Dateinamen: `NNNN_kurzer_name.sql`, aufsteigend und unveraenderlich nach Anwendung.
- Jede Migration verwaltet eine Transaktion und traegt ihre Version am Ende in
  `schema_migrations` ein.
- Neue Schemaaenderungen kommen in eine neue Datei; angewendete Dateien werden
  niemals nachtraeglich editiert.
- `checksums.sha256` fixiert den geprüften Inhalt aller Migrationen. Bei jeder
  neuen Migration wird genau ein neuer Hash ergänzt; bestehende Hashes bleiben
  unverändert. `npm test` erkennt fehlende oder nachträglich veränderte Dateien.
- IDs bleiben vorerst `TEXT`, da neben UUIDs auch stabile kuratierte IDs wie
  `curated:<slug>` existieren.
- Zeitpunkte sind `TIMESTAMPTZ`, Check-in-Kalendertage sind `DATE`.

## Manuelle Anwendung in einer freigegebenen Umgebung

Vorher Backup und Ziel-URL pruefen. Anschliessend kann eine Migration mit dem
PostgreSQL-Client angewendet werden:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0001_initial.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0002_challenge_invitations.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0003_align_challenge_levels.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0004_unique_usernames.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0005_password_reset_tokens.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0006_password_reset_rate_limits.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0007_action_rate_limits.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0008_pending_challenge_default.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0009_rate_limit_pruning_index.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0010_challenge_types.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/postgresql/0011_challenge_mates.sql
```

Vor der Anwendung lassen sich die unveränderlichen Inhalte im
Migrationsverzeichnis zusätzlich prüfen:

```sh
(cd db/migrations/postgresql && sha256sum -c checksums.sha256)
```

Die Migration `0001_initial.sql` bildet das derzeitige SQLite-Schema ab und
setzt Indizes fuer Session-Lookups, oeffentliche Challenge-Listen,
Nutzer-Dashboards, Rankings und Check-ins. Datenmigration, Runtime-Umschaltung
und produktive Ausfuehrung sind eigene spaetere Slices.

`0002_challenge_invitations.sql` ergaenzt zeitlich begrenzte, widerrufbare
Freund-Einladungen. Es wird ausschliesslich ein eindeutiger Token-Hash
persistiert; der spaeter im Link verwendete Roh-Token gehoert nicht in die
Datenbank oder Logs.

`0003_align_challenge_levels.sql` gleicht die PostgreSQL-Constraint an die
versionierten Domainwerte `User`, `Beginner`, `Advanced` und `Premium` an. Falls
bereits Daten mit den urspruenglichen deutschen Zielwerten vorhanden sind,
werden sie vor dem neuen Check kontrolliert auf `Advanced` beziehungsweise
`Premium` ueberfuehrt.

`0004_unique_usernames.sql` normalisiert bestehende Benutzernamen und erzwingt
ihre case-insensitive Eindeutigkeit.

`0005_password_reset_tokens.sql` ergänzt kurzlebige Passwort-Reset-Tokens. Es
wird ausschließlich der eindeutige Token-Hash mit Ablauf-, Nutzungs- und
Widerrufsstatus gespeichert.

`0006_password_reset_rate_limits.sql` und `0007_action_rate_limits.sql`
persistieren die Limits für sensible Passwort-Reset-, Auth- und UGC-Aktionen.
`0008_pending_challenge_default.sql` richtet den Veröffentlichungsstandard für
neue Community-Challenges aus; `0009_rate_limit_pruning_index.sql` ergänzt den
Index für die globale Bereinigung abgelaufener Limit-Ereignisse.

`0010_challenge_types.sql` ergänzt die typisierten Challenge-Definitionen sowie
Messwerte an Check-ins. Bestehende kuratierte Challenges werden anhand stabiler
Slugs deterministisch als kumulatives oder einmaliges Messziel klassifiziert;
alle übrigen Bestandsdaten bleiben tägliche Ja/Nein-Challenges.

`0011_challenge_mates.sql` ergänzt datensparsame Opt-in-Profile, gegenseitig zu
bestätigende Verbindungen sowie Blockierungen und moderierbare Meldungen. Es
werden keine E-Mail-Adressen, Telefonnummern, präzisen Standorte oder externen
Kontaktdaten in ChallengeMate-Profilen gespeichert.
