# Deterministischer SEO-Workflow für Challenge-Seiten

## Ablauf

1. Challenge-Daten pflegen: präziser Titel, konkrete Beschreibung, Ziel, Zeitraum und typisierte Wertung. Kuratierte Inhalte stehen in `data/challenges.ts`; Community-Inhalte durchlaufen die bestehende Veröffentlichung.
2. `buildChallengeSeoContent` in `lib/challenge-seo-content.ts` erzeugt daraus mit Rezeptversion 1 dieselben Inhalte bei denselben Eingaben. Keine KI, Zufallsvarianten, Uhrzeit, externen Dienste oder personenbezogenen Rankingdaten.
3. Die gemeinsame Server-Komponente gibt den Inhalt direkt nach dem Ranking als HTML aus: individuelle Beschreibung, Ziel/Zeitrahmen, typgerechte Erfassung und Wertung, vorhandene Tipps und FAQ, Link zum Katalog. Neue veröffentlichte Community-Challenges sind automatisch abgedeckt. Private Räume sind keine SEO-Landingpages.
4. `npm run seo:check` prüft die vollständige kuratierte Sammlung auf Abdeckung, eindeutige Beschreibungen, Reproduzierbarkeit, unveränderte Eingaben und FAQ sowie alle Wertungsarten und den Community-Fallback.
5. Bei Änderungen zusätzlich `npm run lint`, `npm run build` und `npm run test:e2e -- tests/e2e/challenge-detail.spec.ts tests/e2e/challenge-types.spec.ts` ausführen. Die Browserprüfungen decken Reihenfolge, HTML ohne JavaScript, FAQ/JSON-LD, Community-Inhalte und schmale/breite Layouts ab.

## Redaktionelle Qualität

Der Generator macht aus ungenauen Ausgangsdaten keinen fundierten Artikel. Beschreibungen sollen die konkrete Aufgabe erklären; Tipps sollen zur Aufgabe passen. Vor Veröffentlichung Regeln, Zahlen, Zeitrahmen und Aussagen prüfen. Keine erfundenen Erfahrungswerte, Suchvolumina oder Gesundheitsversprechen ergänzen. Bestehende Metadaten und strukturierte FAQ bleiben unverändert; sichtbare FAQ verwenden dieselbe Datenquelle.

Keine künstliche Mindestwortzahl oder Keyworddichte. Suchmaschinenfreundlichkeit entsteht durch verständliche Inhalte, saubere Überschriften und serverseitig lesbaren Text. Eine Rankingverbesserung ist nicht garantiert. Grundlage: [Google: hilfreiche, verlässliche Inhalte](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

Bei Änderungen der Textregeln die Rezeptversion erhöhen und Tests prüfen. Datenänderungen werden beim nächsten Seitenaufruf übernommen; es gibt keine getrennten Textkopien, die synchronisiert werden müssen. Deployment erfolgt weiterhin nur nach ausdrücklicher Freigabe.
