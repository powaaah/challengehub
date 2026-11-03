# ChallengeHub Mobile

Expo/React Native für iOS und Android. Architektur und nächste Schritte:
[Mobile-ADR](../../docs/mobile-architecture.md).

Vom Repository-Root unabhängig installieren (Node 24 empfohlen):

```sh
cd apps/mobile
npm ci
npm start
npm run ios      # iOS-Simulator auf macOS bzw. Expo Go auf einem Gerät
npm run android  # laufender Android-Emulator bzw. verbundenes Gerät
npm run web      # lokale Layoutvorschau
```

Die drei Startkacheln öffnen den öffentlichen Challenge-Katalog ohne Login.
Challenges lassen sich auswählen; Details zeigen Ziel, Regeln und Tipps.
Lade-, Leer- und Fehlerzustände sowie Nachladen sind implementiert. Beim Zurückgehen
bleiben geladene Katalogseiten erhalten. Es gibt keine Demo-Ergebnisse.

Native Apps lesen die vorhandene öffentliche v1-API auf `https://theovina.de`.
`challengehub.de/api/v1/challenges` liefert derzeit 404. Die Browser-Vorschau
und der Expo-Web-Devserver leiten ausschließlich öffentliche Katalog-GETs über
einen lokalen Proxy weiter (keine Cookies, keine Authorization, keine Schreibwege).
Die Website und ihre CORS-/Auth-Konfiguration werden nicht geändert.
Internetverbindung nötig. Ein anderer HTTPS-API-Host kann über
`EXPO_PUBLIC_API_BASE_URL` in `.env.local` eingestellt werden; im Browser muss
dieser Host CORS erlauben. Die Variable ist öffentlich und darf keine Secrets
enthalten. Bei Unternehmensproxy kann unter Node 24 `NODE_USE_ENV_PROXY=1`
für den lokalen Server nötig sein.

Über den weißen Plus-Button lassen sich jetzt eigene Challenges lokal erstellen:
Titel, Ziel, Dauer (1–365 Tage), Regeln und Wertung (täglich abhaken, Werte sammeln
oder einmaliges Ergebnis mit Einheit/Zielrichtung). Vorschau vor dem Speichern;
„Deine eigenen Challenges“ auf der Startseite erlaubt Öffnen und bestätigtes Löschen.

Speicherung via AsyncStorage unter `challengehub.local-challenges.v1` (Web:
Browser-Speicher dieses Ursprungs; native App: Gerätespeicher), maximal 100 Einträge.
Keine Registrierung, kein Upload und keine Veröffentlichung. Einträge überleben
das Neuladen, gehen aber bei Löschen der Browser-/App-Daten verloren und werden
nicht zwischen Geräten oder Browser-Ursprüngen synchronisiert. Keine Zugangstokens
in diesem Speicher. Beschädigte/unbekannte Speicherdaten sperren neue Schreibzugriffe,
statt vorhandene Daten zu überschreiben; ein erneuter Leseversuch ist möglich.
Die bestehende Challenge-Definition wird für Wertungsarten wiederverwendet;
Grenzen für Titel, Ziel, Regeln und Dauer entsprechen den bestehenden Textgrenzen.
Nach diesem Update einmal `npm ci` ausführen (neue native Speicherabhängigkeit).

## Persönliche Teilnahme und Fortschritt

Bestehende oder eigene Challenge öffnen → „Challenge starten“ → Fortschritt.
Wenn die öffentliche API keine feste Tagesdauer liefert, wird vor dem Start ein
persönliches Zeitfenster gewählt (1–365 Tage; Regeln beachten). Einmalige Ziele
schlagen einen Tag vor, tägliche/kumulative Ziele 30 Tage. Body Transformation
bleibt wegen ihrer speziellen Messwert-/Bildlogik vom Start ausgeschlossen.

„Meine Challenges“ auf der Startseite trennt laufende und beendete Versuche.
Tägliche Challenges erlauben einen Haken pro Kalendertag. Kumulative Einträge
werden addiert; bei einmaligen Ergebnissen zählt je nach Richtung der höchste
oder niedrigste positive Wert. Bei Zielerreichung wird der Versuch abgeschlossen;
ein ohne Zielerreichung abgelaufener Zeitraum heißt ausdrücklich „Zeitraum beendet“.
Verläufe lassen sich nach Bestätigung löschen; die Vorlage bleibt erhalten.

Beim Start werden Regeln, Definition, Dauer und Gerätezeitzone festgehalten.
Heute zählt als Tag 1; das Ende ist die lokale Mitternacht nach dem letzten Tag
(exklusive Endgrenze). Einträge vor Start, nach Ende, nach Abschluss und doppelte
Tageshaken werden abgewiesen. Reisen verändern die festgelegte Zeitzone nicht.
Diese lokale Zeitprüfung verwendet die Geräteuhr und ist kein manipulationssicherer
Wettbewerbsnachweis. Ein offener Versuch derselben Quelle wird wieder geöffnet.

Fortschritt liegt separat unter `challengehub.participations.v1` im Gerätespeicher
(maximal 100 Versuche mit je 2000 Einträgen); Regeln werden beim Lesen validiert.
Beschädigte Daten blockieren neue Schreibvorgänge. Speicherfehler erhalten den
bisherigen Zustand und erlauben erneutes Speichern. Keine Synchronisierung,
Einladungen, privaten Battles oder öffentlichen Ranglisteneinträge; diese folgen
in eigenen Slices. Kein Login für die hier gebauten Abläufe.

```sh
npm run typecheck
npm run lint
npm test
npm run test:proxy
npm run export:native
```

`export:native` prüft iOS-/Android-JavaScript-Bundles; es baut keine APK/IPA.
Vor Beta zusätzlich echte Geräte, VoiceOver/TalkBack, große Systemschrift,
Android-Zurück und Hoch-/Querformat prüfen. Noch keine EAS-Projektverknüpfung,
Store-IDs, Push-Berechtigungen oder veröffentlichbaren Deep-Link-Endpunkte.
Das URL-Scheme allein implementiert keine Einladung und keine Deferred Links.

Die Website bleibt am Repository-Root mit ihren bisherigen npm-Kommandos.
Mobile-Abhängigkeiten/Lockfile werden separat gepflegt, damit unterschiedliche
React-Versionen die Website nicht verändern. Metro beobachtet zusätzlich nur
`clients` und `domain`: der vorhandene API-Client und sein Validator werden
wiederverwendet. Die gemeinsamen DTO-Typen liegen ohne Node-/Server-Abhängigkeiten
in `domain/challenges/public-challenge-api-types.ts`. Kein Deployment in diesem Slice.

## Handy-Vorschau am Rechner

`npm run simulator` baut die Web-Vorschau und startet einen ausschließlich lokalen
Server. Öffne **http://localhost:8096/simulator**. Umschaltbar: iPhone 14 Pro
(393 × 852 logische Pixel) und Galaxy S26 (angenommener Android-Viewport
412 × 915). Rahmen, Statusbereich und Gestenleiste umgeben die echte interaktive
Web-App. Der Größenregler skaliert die Vorschau, ohne die Layoutbreite zu ändern.
Keine native OS-Emulation; Android-Anzeigeeinstellungen können abweichen.
Zum Beenden Strg+C drücken.
