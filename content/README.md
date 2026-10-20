# Texte bearbeiten

- `pages/startseite.md`: Startseite einschließlich „So funktioniert’s“
- `pages/challenges.md`: Challenge-Übersicht
- `pages/wissen.md`: Einleitung der Wissensübersicht
- `pages/impressum.md`: Impressum
- `pages/datenschutz.md`: Datenschutzhinweise
- `pages/sicherheit.md`: Sicherheit und Gesundheit
- `pages/karriere.md`: Karriere
- `challenges/*.md`: einzelne Challenges, siehe [Anleitung](../docs/challenge-markdown-backend.md)

## Seitentexte ändern

Öffne die passende Datei unter `pages` und ändere den Text unter dem jeweiligen
`## Abschnittsschlüssel`. Die Schlüssel bleiben unverändert, auch wenn du die
Überschrift der sichtbaren Seite neu formulierst. Sie ordnen jeden Text seinem
Platz im bestehenden Layout zu und erscheinen nicht auf der Website.
Abschnitte dürfen umsortiert werden, aber nicht gelöscht oder umbenannt werden.
Identische Texte können mehrfach auf der Seite verwendet werden.

Die Inhalte dieser Abschnitte sind Klartext: Zeilenumbrüche werden zu Leerzeichen.
Markdown-Formatierungen wie `**fett**`, HTML und neue Listen werden hier nicht
interpretiert. Überschriften, Listen, Links und Buttons behalten die Formatierung
und Ziele der bestehenden Seite. Bei verlinkten Sätzen stehen Text vor dem Link,
Linkbeschriftung und Text nach dem Link gegebenenfalls in getrennten Abschnitten.

Nach Änderungen `npm run content:build` ausführen. `npm run dev` und
`npm run build` übernehmen das automatisch. Bei bereits laufendem Dev-Server
erneut `npm run content:build` ausführen. `npm run content:check` prüft die
Synchronisation. Dateien unter `data/*.generated.ts` nicht direkt bearbeiten.
Für die öffentliche Website ist weiterhin ein neuer Build und ein freigegebenes
Deployment erforderlich.

## Grenzen

Wissensartikel stehen weiterhin in `data/habit-articles.ts`, die technische
Datenschutz-Dateninventur in `data/privacy-data-inventory.ts`. Navigation,
Metadaten für Suchmaschinen, Formularmeldungen und persönliche Kontoseiten
werden weiterhin im Code gepflegt. Diese Dateien ersetzen keine fachliche
Freigabe der bestehenden vorläufigen Rechtstexte.
