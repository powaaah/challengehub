# ChallengeHub Product Decisions

Stand: 2026-10-12

## Personas

Die am 2026-10-12 bestätigte Zielgruppen-Grundlage steht in [Personas](personas.md).
Tim ist die primäre Persona, Stefan folgt knapp dahinter. Melanie, Aylin und
Matthias ergänzen die beiden Hauptpersonen. Melanies Journey besteht aus einer
Sammel-Challenge mit mehreren Teil-Challenges; die konkrete Wertung ist noch offen.
Die folgenden älteren Entscheidungen werden durch diese Dokumentation nicht technisch verändert.

## Header Navigation

- `Wissen` wird aus dem Header entfernt.
- `Wissen` bleibt im Footer erreichbar.
- Ausgeloggte Nutzer sehen im Header nur primaere Orientierung und Login:
  - `Challenges`
  - `Ranking`
  - `Login`
- `Meine Challenges` wird nicht fuer ausgeloggte Nutzer im Header angezeigt.

## Eingeloggter Zustand

- Wenn ein Nutzer eingeloggt ist, ersetzt ein Profil-Button den Login-Button.
- Solange es keinen Avatar-Upload oder externes Profilbild gibt, zeigt der
  Profil-Button Initialen oder einen neutralen Avatar-Platzhalter.
- Bei Klick oeffnet sich ein Dropdown-Menue.

## Profil-Dropdown

Das Profil-Dropdown ist fuer persoenliche Nutzerfunktionen reserviert.

Geplante Eintraege:

- `Konto`
- `Meine Challenges`
- `Challenge Mate finden`
- `Logout`

Nicht im Profil-Dropdown:

- `Challenge erstellen`

Begruendung: `Challenge erstellen` ist keine Account-Verwaltung, sondern eine
oeffentliche Produktaktion. Sie sollte nicht mit persoenlichen Kontofunktionen
vermischt werden.

## Challenge Erstellen

`Challenge erstellen` soll nicht dauerhaft prominent im Header stehen.

Begruendung:

- Ohne Abgleich mit bestehenden Challenges entstehen leicht Duplikate.
- ChallengeHub soll Nutzer zuerst zum Finden passender Challenges fuehren.
- Neue Challenges sollen erst entstehen, wenn wirklich keine passende Challenge
  vorhanden ist.

Geplante Produktlogik:

1. Nutzer suchen zuerst im Challenge-Katalog.
2. Wenn keine passende Challenge gefunden wird, erscheint ein dezenter CTA,
   zum Beispiel: `Keine passende Challenge gefunden? Neue Challenge vorschlagen`.
3. Vor dem Erstellen werden aehnliche bestehende Challenges angezeigt.
4. Erst danach kann der Nutzer bewusst eine neue Challenge anlegen.

Prinzip: Erst finden, dann erstellen.

## Challenge Mate Finden

`Challenge Mate finden` soll eine eingeloggt sichtbare persoenliche Funktion
werden.

Produktidee:

- Nutzer finden andere Nutzer aus derselben Stadt oder Umgebung.
- Matching basiert spaeter auf:
  - Stadt oder grobem Standort
  - Radius
  - Interessen
  - aktiven Challenges
  - aehnlichen Zielkategorien
- Ziel ist, Menschen zusammenzubringen, die gemeinsam an ihren Zielen arbeiten.

MVP-Scope:

- Zunaechst nur Menuepunkt und vorbereitende Route, zum Beispiel
  `/challenge-mate`.
- Noch kein echtes Matching, solange Standort, Profilfelder und Privatsphaere
  nicht sauber modelliert sind.

Wichtige Privacy-Anforderungen fuer spaeter:

- Sichtbarkeit muss aktiv einstellbar sein.
- Standort darf nur grob oder ueber Radius genutzt werden.
- Kontakt sollte erst nach beidseitigem Interesse moeglich sein.

## 2026-10-17 - Leistung und Journey

Einmalige Challenges dokumentieren eine bereits erbrachte Leistung und gegebenenfalls eine Bestzeit. Zweitaktion: jemanden herausfordern; mit gespeicherter Zeit: Schlage meine Zeit. Journeys begleiten die Vorbereitung und behalten ChallengeMate finden. Liegestuetz-Leistung und Vorbereitung sind gegenseitig verlinkt. Keine unbelegten Bevoelkerungsperzentile; ein spaeterer Rangvergleich muss die reale Vergleichsgruppe nennen.

### Bestätigte Body-Transformation-Wertung

Stefan hat am 2026-10-17 die Navy-Formel als Grundlage bestätigt. Diese Entscheidung ersetzt die vorläufige Tagesplanwertung und die zwischenzeitliche Entscheidung gegen ein Gesamtranking. Ziel der 100 Tage Body Transformation: Fett abbauen und Muskeln erhalten. Die Rangliste wertet die Abnahme des geschätzten Körperfettanteils nach der verbreiteten US-Navy-Umfangsformel in Prozentpunkten: Start-KFA minus End-KFA. Beispiel: 28 % auf 24 % ergibt 4 Prozentpunkte. Kein zusätzlicher Muskelerhalt-Bonus, kein zusammengesetzter Score. Die Schätzung gilt nicht als Nachweis des Muskelerhalts.

Benötigte Eingaben: Formelvariante und Körpergröße; für die männliche Variante Hals- und Bauchumfang, für die weibliche Variante Hals-, Taillen- und Hüftumfang. Messstellen werden eindeutig erklärt; Berechnungen verwenden konsistente Einheiten und dieselbe Formelversion für Start und Ende. Fehlende Messwerte ergeben keinen KFA und keinen Ranglistenwert.

Start- und Endbild sowie tägliche Einträge von Gewicht und Bauchumfang zeigen den persönlichen Verlauf. Weitere Navy-Messwerte ermöglichen KFA-Verlaufspunkte. Gewicht ist kein Eingangswert der Navy-Formel. Teil-Challenges können parallel mit eigenen Zielen und Rhythmen geführt werden, etwa Schlaf, Schritte, Radfahren, Gym und Kalorien; sie verändern den KFA-Ranglistenwert nicht.

Implementiert: private tägliche Messwertspeicherung und Verlauf, Navy-Berechnung (Version navy-circumference-v1), Start-/Endbilder, Teil-Challenges und KFA-Rangliste. Vollständige Tag-1-Messung erforderlich; Tag-100-Messung liefert das Endergebnis. Zwischenstände werden separat angezeigt. Einträge können innerhalb des vergangenen Challenge-Zeitraums korrigiert werden; keine zukünftigen Messungen. Formelvariante und Körpergröße bleiben nach dem ersten Eintrag fest. Auf eine Nachkommastelle gerundete gleiche Ergebnisse teilen sich einen Rang. Ein öffentlicher Rankingwert setzt die bestehende Freigabe im Profil voraus. Rohdaten und Bilder bleiben privat und sind in Export und Kontolöschung enthalten.

Formelreferenz: https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2023.1183836/full (Umfangsformeln mit Umrechnung von cm in Zoll). Die dort beschriebenen Messgrenzen werden nicht als Muskelerhalt-Nachweis ausgelegt. Teil-Challenges zeigen Tageswerte beziehungsweise Wochensummen (Montag bis Sonntag) gegen persönliche Ziele; keine automatische medizinische Zielvorgabe.
