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

Die drei Startkacheln öffnen die jeweiligen vorbereiteten Einstiege. Anmeldung,
Katalog, Battles und Rankings sind noch nicht angebunden. Die App ruft keine
Produktionsdienste auf und enthält keine Demo-Ergebnisse.

```sh
npm run typecheck
npm run lint
npm test
npm run export:native
```

`export:native` prüft iOS-/Android-JavaScript-Bundles; es baut keine APK/IPA.
Vor Beta zusätzlich echte Geräte, VoiceOver/TalkBack, große Systemschrift,
Android-Zurück und Hoch-/Querformat prüfen. Noch keine EAS-Projektverknüpfung,
Store-IDs, Push-Berechtigungen oder veröffentlichbaren Deep-Link-Endpunkte.
Das URL-Scheme allein implementiert keine Einladung und keine Deferred Links.

Die Website bleibt am Repository-Root mit ihren bisherigen npm-Kommandos.
Mobile-Abhängigkeiten/Lockfile werden separat gepflegt, damit unterschiedliche
React-Versionen die Website nicht verändern. Kein Deployment in diesem Slice.
