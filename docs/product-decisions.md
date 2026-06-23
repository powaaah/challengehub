# ChallengeHub Product Decisions

Stand: 2026-06-23

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
