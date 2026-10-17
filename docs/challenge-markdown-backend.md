# Challenges über Markdown pflegen

Die 17 kuratierten Challenges werden in `content/challenges/` gepflegt. Jede Markdown-Datei enthält die vollständige redaktionelle Definition einschließlich Regeln, FAQ, Header und SEO-Text unter dem Ranking. Nutzerkonten, Teilnahmen, Messwerte und Bilder bleiben in der Datenbank. Von Nutzern erstellte Challenges werden weiterhin über die Anwendung verwaltet.

## Bearbeiten und veröffentlichen

1. Eine vorhandene Datei bearbeiten oder für eine neue Challenge kopieren.
2. Bei neuen Challenges eine eindeutige `id` mit Präfix `curated:` und einen eindeutigen `slug` vergeben. Bestehende IDs und Slugs dauerhaft beibehalten; Dateiname und Titel dürfen sich ändern.
3. `npm run content:build` validiert alle Dateien und erzeugt den Website-Katalog. Während `npm run dev` läuft, nach jeder Markdown-Änderung diesen Befehl erneut ausführen.
4. `npm run content:sync` zeigt den geplanten Datenbankabgleich ohne Schreibzugriff. `npm run content:sync -- --apply` wendet ihn auf die konfigurierte lokale Datenbank an.
5. Für die Veröffentlichung einen neuen Produktionsbuild mit `npm run build` erstellen und regulär deployen. `npm run start` prüft, ob Dateien, Katalog und Build zusammenpassen, und gleicht anschließend die Datenbank ab.

Eine Dateibearbeitung allein verändert die laufende Produktionswebsite noch nicht. Den generierten Katalog `data/challenges.generated.ts` nicht manuell bearbeiten. Er wird zusammen mit den Markdown-Dateien versioniert. `npm run content:check` erkennt Abweichungen.

## Aufbau einer Datei

Als Vorlage beispielsweise `content/challenges/100-liegestuetze-am-stueck.md` verwenden. Zwischen den ersten beiden `---` steht **JSON**, kein YAML. Der Kopf enthält Metadaten und die strukturierte Wertung (`definition`). `header.image` verweist auf ein vorhandenes JPG unter `public/images/challenges/` ohne Dateiendung.

Pflichtabschnitte sind `## Ziel`, `## Beschreibung`, `## SEO-Beschreibung`, `## Regeln`, `## Tipps`, `## FAQ` und `## SEO-Text`. Regeln und Tipps enthalten je Eintrag eine Zeile mit `- `. FAQ-Fragen stehen als `### Frage` über ihrer Antwort.

Unter `## SEO-Text` beginnt der eigentliche Artikel mit einer `## Überschrift`. Der Renderer unterstützt Absätze, H2/H3, Aufzählungen, Fettschrift und Links mit HTTP(S) oder lokalen Pfaden. HTML und MDX werden nicht ausgeführt. Keine zusätzliche H1 einfügen; diese liefert der Seitentitel.

## Entfernen, Wiederherstellen und Versionen

- Datei entfernen: Beim nächsten Abgleich verschwindet die Challenge aus dem öffentlichen Katalog. Datenbankeintrag und zugehörige Teilnahmen werden archiviert; Ergebnisse und Check-ins bleiben erhalten. Neue Teilnahmen und Check-ins sind dann gesperrt.
- Dieselbe Datei mit derselben ID wiederherstellen: Die Challenge wird erneut veröffentlicht und die zuvor archivierten Teilnahmestatus werden wiederhergestellt.
- Jede übernommene Inhaltsänderung wird als vollständige Revision in SQLite gespeichert. Git dokumentiert zusätzlich die Dateihistorie.
- Sobald Teilnahmen bestehen, werden Änderungen an Regeln, Wertungsdefinition und bereits versionierter Dauer zurückgewiesen. Für eine andere Wertung eine neue Ausgabe mit neuer ID und neuem Slug erstellen. Titel, Beschreibung und SEO-Text bleiben bearbeitbar.
- Ungültige Dateien, doppelte Kennungen und Kollisionen brechen den gesamten Abgleich ab. Ein fehlender oder vollständig leerer Inhaltsordner archiviert aus Sicherheitsgründen nicht automatisch alle Challenges.

Der Abgleich übernimmt bestehende kuratierte Datenbankeinträge anhand ihrer festen IDs. Er ersetzt weder die Datenbank noch die darin gespeicherten Nutzerdaten. Redaktionelle Links auf entfernte Challenges müssen bei der Inhaltsbearbeitung ebenfalls angepasst werden.
