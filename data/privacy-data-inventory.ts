export type PrivacyDataInventoryEntry = {
  id: string;
  title: string;
  data: string;
  purpose: string;
  recipients: string;
  implementedLifecycle: string;
  reviewRequired: boolean;
};

export const privacyDataInventory: PrivacyDataInventoryEntry[] = [
  {
    id: "account",
    title: "Konto und Anmeldung",
    data: "Benutzername, E-Mail-Adresse, Passwort-Hash, Verifikationszeitpunkt sowie gehashte Sitzungstokens.",
    purpose: "Konto anlegen, Anmeldung absichern und den angemeldeten Bereich bereitstellen.",
    recipients: "Verarbeitung auf dem Hosting-System; keine öffentliche Ausgabe der E-Mail-Adresse oder des Passwort-Hashes.",
    implementedLifecycle: "Kontodaten bleiben bis zur Kontolöschung gespeichert. Sitzungen sind 30 Tage nutzbar und werden bei Logout, Passwort-Zurücksetzung oder Kontolöschung entfernt. Für abgelaufene Sitzungsdatensätze ist noch keine automatische Löschroutine implementiert.",
    reviewRequired: true
  },
  {
    id: "account-tokens",
    title: "Passwort- und E-Mail-Tokens",
    data: "Ausschließlich SHA-256-Hashes von Passwort-Zurücksetzungs- und E-Mail-Bestätigungstokens sowie Erstellungs-, Ablauf- und Nutzungszeitpunkte.",
    purpose: "Einmalige Passwort-Zurücksetzung und Bestätigung der hinterlegten E-Mail-Adresse.",
    recipients: "Beim Versand erhält der konfigurierte E-Mail-Dienst Resend die Zieladresse und den jeweiligen Einmal-Link; ohne Versandkonfiguration werden keine E-Mails übertragen.",
    implementedLifecycle: "Links sind 30 Minuten gültig. Fehlgeschlagene Versandversuche werden sofort verworfen; verwendete, ersetzte und abgelaufene Datensätze bleiben derzeit bis zur Kontolöschung gespeichert. Eine zusätzliche automatische Löschfrist ist noch festzulegen und technisch umzusetzen.",
    reviewRequired: true
  },
  {
    id: "challenges",
    title: "Challenges und Fortschritt",
    data: "Erstellte Challenges, Teilnahmen, Start- und Abschlusszeitpunkte, Check-in-Datum, Messwert und optionale Notiz.",
    purpose: "Challenges veröffentlichen, persönlichen Fortschritt berechnen und die gewählten Community-Funktionen bereitstellen.",
    recipients: "Verarbeitung auf dem Hosting-System. Veröffentlichte Challenges sind öffentlich; Ranking und Aktivitätsfeed zeigen personenbezogene Fortschrittsdaten nur nach der jeweiligen Freigabe im Profil.",
    implementedLifecycle: "Persönliche Teilnahmen und Check-ins werden bei Kontolöschung entfernt. Entwürfe und nicht veröffentlichte eigene Challenges werden ebenfalls gelöscht; veröffentlichte Challenges bleiben ohne Kontoverknüpfung erhalten. Eine kürzere automatische Frist ist nicht implementiert.",
    reviewRequired: true
  },
  {
    id: "invitations",
    title: "Challenge-Einladungen",
    data: "Einladende Teilnahme, Hash des Einladungstokens, Ablauf-, Annahme- und Widerrufszeitpunkte sowie gegebenenfalls das annehmende Konto.",
    purpose: "Zeitlich begrenzte Einladungen sicher erstellen und nur einmal annehmen.",
    recipients: "Der von der einladenden Person selbst geteilte Link geht an die gewählte empfangende Person; die Zuordnung wird ansonsten auf dem Hosting-System verarbeitet.",
    implementedLifecycle: "Einladungslinks sind sieben Tage gültig. Datensätze bleiben derzeit bis zur Löschung der zugehörigen Teilnahme beziehungsweise des Kontos gespeichert; eine automatische Bereinigung abgelaufener Einladungen ist noch nicht implementiert.",
    reviewRequired: true
  },
  {
    id: "challenge-mate",
    title: "ChallengeMate, Meldungen und Blockierungen",
    data: "Freiwilliges Ziel, Zeitraum, Remote-Angabe oder grober Ort, Kontaktanfragen, Matches, Blockierungen und Meldungsgrund mit optionalen Details.",
    purpose: "Passende ChallengeMates vorschlagen, beidseitige Verbindungen herstellen und Missbrauch bearbeiten.",
    recipients: "Kompatible ChallengeMate-Nutzer sehen die freigegebenen Profildaten; Meldungen sind für die interne Moderation bestimmt. Es werden keine direkten Kontaktdaten oder präzisen Standorte freigegeben.",
    implementedLifecycle: "Die Auffindbarkeit kann pausiert werden. Profile, Verbindungen, Blockierungen und Meldungen bleiben bis zur Kontolöschung gespeichert; verbindliche Prüf- und Löschfristen für Moderationsdaten sind noch festzulegen.",
    reviewRequired: true
  },
  {
    id: "notifications",
    title: "In-App- und E-Mail-Erinnerungen",
    data: "Opt-in-Einstellungen, Typ und Inhalt der Mitteilung, Bezugszeitpunkt, Gelesen-Status und Zeitpunkt einer erfolgreichen E-Mail-Zustellung.",
    purpose: "Gewählte Erinnerungen, Wochenrückblicke und ChallengeMate-Ereignisse zustellen und doppelte Zustellungen verhindern.",
    recipients: "In-App-Verarbeitung auf dem Hosting-System. Nur bei aktivierter E-Mail-Funktion erhält Resend Zieladresse, Nachrichteninhalt sowie Challenge- und Abmeldelink.",
    implementedLifecycle: "Tageserinnerungen und Wiedereinstiegshinweise werden bei der nächsten Synchronisierung ersetzt oder entfernt, sobald sie nicht mehr aktuell sind. Andere Mitteilungen und Zustellnachweise bleiben bis zur Kontolöschung gespeichert; eine zusätzliche automatische Frist ist noch offen.",
    reviewRequired: true
  },
  {
    id: "abuse-prevention",
    title: "Missbrauchsschutz",
    data: "Mit einem geheimen HMAC pseudonymisierte Kennungen aus E-Mail-Adresse, Benutzerkennung, Token oder Client-IP sowie Zeit, Limitbereich und Ereignis-ID.",
    purpose: "Login, Registrierung, Zurücksetzung, Verifikation und schreibende Produktaktionen gegen automatisierten Missbrauch begrenzen.",
    recipients: "Ausschließlich Verarbeitung auf dem Hosting-System; die Rate-Limit-Tabellen speichern nicht die jeweiligen Rohkennungen.",
    implementedLifecycle: "Bei der nächsten limitierten Aktion werden allgemeine Ereignisse entfernt, sobald sie älter als 24 Stunden sind. Separate Passwort-Zurücksetzungsanfragen werden beim nächsten solchen Versuch auf das laufende Ein-Stunden-Fenster gekürzt. Ohne eine neue Anfrage findet noch keine zeitgesteuerte Bereinigung statt.",
    reviewRequired: true
  },
  {
    id: "operations",
    title: "Hosting-Protokolle und Löschvermerk",
    data: "Technisch notwendige Server- und Fehlerprotokolle außerhalb der Anwendungsdatenbank sowie ein Löschvermerk ohne Nutzer-ID, E-Mail oder Namen mit Zeitpunkt und Anzahl übertragener Veröffentlichungen.",
    purpose: "Stabiler und sicherer Betrieb sowie technischer Nachweis einer ausgeführten Kontolöschung.",
    recipients: "Hosting-Betrieb beziehungsweise berechtigte Administration; konkrete Unterauftragnehmer sind vor Produktionsstart anhand der finalen Infrastruktur zu benennen.",
    implementedLifecycle: "Für externe Server- und Fehlerprotokolle setzt die Anwendung selbst keine Frist. Der nicht personenbezogene Löschvermerk besitzt noch keine automatische Löschfrist. Beide Punkte benötigen eine verbindliche Betriebs- und Rechtsfreigabe.",
    reviewRequired: true
  }
];
