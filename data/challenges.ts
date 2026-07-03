export type ChallengeLevel = "User" | "Beginner" | "Advanced" | "Premium";

export type Challenge = {
  title: string;
  slug: string;
  level: ChallengeLevel;
  participants: number;
  rating: number;
  createdAt: string;
  duration: string;
  goal: string;
  description: string;
  seoDescription: string;
  tips: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  benefits?: ChallengeBenefit[];
  plan?: ChallengePlan;
  stack?: Array<{
    title: string;
    text: string;
  }>;
  rules: string[];
};

export type ChallengeBenefit = {
  title: string;
  text: string;
  source: {
    label: string;
    url: string;
  };
};

export type ChallengePlan = {
  title: string;
  intro: string;
  weeks: Array<{
    label: string;
    focus: string;
    tasks: string[];
  }>;
};

const sources = {
  stepsMortality: {
    label: "Paluch et al., Lancet Public Health 2022",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9289978/"
  },
  strengthMortality: {
    label: "Momma et al., British Journal of Sports Medicine 2022",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9209691/"
  },
  sleepConsensus: {
    label: "AASM/Sleep Research Society Consensus Statement",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4442216/"
  },
  sleepLearning: {
    label: "Sleep and Learning: A Systematic Review",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11511274/"
  },
  implementationIntentions: {
    label: "Cross & Sheffield, Implementation Intentions Meta-Analysis",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8149892/"
  },
  longHours: {
    label: "WHO/ILO long working hours analysis",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8204267/"
  },
  timeRestrictedEating: {
    label: "Pavlou et al., Time-restricted eating RCT",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11937878/"
  }
};

export const challenges: Challenge[] = [
  {
    title: "10.000 Schritte am Tag",
    slug: "10000-schritte-am-tag",
    level: "Beginner",
    participants: 65,
    rating: 4.8,
    createdAt: "2023-08-01",
    duration: "Dauerhaft",
    goal: "Jeden Tag 10.000 Schritte vollmachen.",
    description: "Zeig, dass du diszipliniert bist: Lauf einfach jeden Tag deine 10.000 Schritte. Heute erst 8.000? Dann geh noch eine Runde und mach die 10.000 voll.",
    seoDescription: "Starte die 10.000 Schritte am Tag Challenge: jeden Tag Schritte vollmachen, Streak halten, Ranking knacken und praktische Rechner nutzen.",
    tips: ["Checke deinen Stand am Nachmittag, nicht erst kurz vor Mitternacht.", "Speichere dir eine feste Abendrunde für fehlende Schritte.", "Mach Telefonate im Gehen.", "Steig eine Haltestelle früher aus oder parke weiter weg.", "Wenn noch 2.000 Schritte offen sind: Schuhe an und Runde fertig machen."],
    faq: [
      { question: "Zählen Schritte aus dem Alltag?", answer: "Ja, alle Schritte zählen: Spaziergang, Arbeitsweg, Einkauf, Treppen und die kleine Extrarunde am Abend." },
      { question: "Brauche ich eine Smartwatch?", answer: "Nein. Smartphone, Smartwatch oder einfacher Schrittzähler reichen. Wichtig ist nur, dass du jeden Tag gleich zählst." },
      { question: "Was passiert, wenn ich nur 8.000 Schritte habe?", answer: "Dann fehlen noch 2.000. Genau darum geht es: rausgehen, Runde drehen, 10.000 vollmachen." }
    ],
    benefits: [
      {
        title: "Mehr Schritte sind eine einfache Orientierung.",
        text: "10.000 Schritte sind keine magische Grenze, aber eine klare Zahl: leicht zu verstehen, leicht zu tracken und gut genug, um jeden Tag Bewegung sichtbar zu machen.",
        source: sources.stepsMortality
      }
    ],
    rules: ["10.000 Schritte zählen pro Kalendertag.", "Der Tageswert muss vor Mitternacht erreicht sein.", "Verpasst ist verpasst: Der Streak startet wieder bei 0."]
  },
  {
    title: "100 Liegestütze am Stück",
    slug: "100-liegestuetze-am-stueck",
    level: "Premium",
    participants: 12,
    rating: 4.2,
    createdAt: "2023-08-15",
    duration: "Einmalig",
    goal: "100 saubere Liegestütze ohne Unterbrechung schaffen.",
    description: "Eine Kraft- und Durchhalte-Challenge fuer Brust, Schultern, Arme und mentale Staerke.",
    seoDescription: "Trainiere für 100 Liegestütze am Stück: Challenge-Ziel, Regeln, Tipps und saubere Ausführung.",
    tips: ["Trainiere mit festen Saetzen statt jeden Versuch bis ans Limit zu gehen.", "Erhoehe das Volumen schrittweise.", "Filme einzelne Saetze, um die Technik zu pruefen."],
    faq: [
      { question: "Wie streng ist die Technik?", answer: "Eine Wiederholung zaehlt, wenn Koerperlinie, Tiefe und Streckung kontrolliert bleiben." },
      { question: "Sind kurze Pausen erlaubt?", answer: "Kurze Pausen in der oberen Position sind erlaubt, solange die Serie nicht abgebrochen wird." }
    ],
    benefits: [
      {
        title: "Krafttraining ist mehr als Optik.",
        text: "Eine systematische Review und Meta-Analyse fand Zusammenhaenge zwischen muskelstaerkenden Aktivitaeten und niedrigerem Risiko fuer Gesamtsterblichkeit und mehrere nicht-uebertragbare Erkrankungen.",
        source: sources.strengthMortality
      }
    ],
    plan: {
      title: "6-Wochen-Liegestuetz-Plan",
      intro: "Trainiere nicht jeden Satz bis zum Scheitern. Das Ziel ist Volumen, Technik und eine starke letzte Testwoche.",
      weeks: [
        { label: "Woche 1-2", focus: "Technik und Basis", tasks: ["3 Einheiten pro Woche.", "5 Saetze mit etwa 50 Prozent deiner Max-Wiederholungen."] },
        { label: "Woche 3-4", focus: "Volumen aufbauen", tasks: ["4 Einheiten pro Woche.", "Pro Einheit 40-70 saubere Wiederholungen sammeln."] },
        { label: "Woche 5", focus: "Lange Saetze", tasks: ["2 schwere Tage mit langen Saetzen.", "2 leichte Tage fuer Technik und Erholung."] },
        { label: "Woche 6", focus: "Test vorbereiten", tasks: ["Volumen reduzieren.", "Nach 2 leichten Tagen den 100er-Versuch starten."] }
      ]
    },
    rules: ["Nur saubere Wiederholungen zaehlen.", "Kurze Pausen in der oberen Position sind erlaubt.", "Die Knie duerfen den Boden nicht beruehren."]
  },
  {
    title: "100 Burpees pro Tag",
    slug: "100-burpees-pro-tag",
    level: "Advanced",
    participants: 27,
    rating: 3.2,
    createdAt: "2023-09-02",
    duration: "Zeitraum",
    goal: "30 Tage lang jeden Tag 100 Burpees absolvieren.",
    description: "Intensives Ganzkoerpertraining fuer Kondition, Disziplin und eine gute Portion Willenskraft.",
    seoDescription: "100 Burpees pro Tag als 30-Tage-Challenge: Regeln, Ziel, Trainingshinweise und Motivation.",
    tips: ["Teile die Wiederholungen in kleine Bloecke auf.", "Starte mit sauberem Tempo statt maximaler Geschwindigkeit.", "Plane leichte Mobility nach dem Training ein."],
    faq: [
      { question: "Muss ich alle Burpees am Stück machen?", answer: "Nein, du kannst die 100 Wiederholungen über den Tag verteilen." },
      { question: "Ist die Challenge fuer Anfaenger geeignet?", answer: "Sie ist eher fortgeschritten und sollte an Fitnesslevel und Gesundheit angepasst werden." }
    ],
    benefits: [
      {
        title: "Kombiniert Ausdauer, Kraft und Gewohnheit.",
        text: "Regelmaessige koerperliche Aktivitaet und muskelstaerkende Belastung sind in Studien mit besseren Gesundheitsmarkern und niedrigerem Krankheitsrisiko verbunden.",
        source: sources.strengthMortality
      }
    ],
    rules: ["Die 100 Burpees duerfen ueber den Tag verteilt werden.", "Jede Wiederholung endet mit einem Strecksprung.", "Dokumentiere deinen Fortschritt taeglich."]
  },
  {
    title: "30 Tage ohne Zucker",
    slug: "30-tage-ohne-zucker",
    level: "Premium",
    participants: 0,
    rating: 4.0,
    createdAt: "2023-10-10",
    duration: "Zeitraum",
    goal: "30 Tage lang auf zugesetzten Zucker verzichten.",
    description: "Eine Ernaehrungs-Challenge, die Bewusstsein fuer Gewohnheiten, Snacks und versteckte Zuckerquellen schafft.",
    seoDescription: "30 Tage ohne Zucker: Challenge-Regeln, Tipps fuer den Alltag und Motivation fuer bewusste Ernaehrung.",
    tips: ["Pruefe Getraenke zuerst, dort versteckt sich oft Zucker.", "Bereite einfache Snacks vor.", "Notiere Situationen, in denen Heisshunger entsteht."],
    faq: [
      { question: "Ist Obst erlaubt?", answer: "Ja, Obst ist erlaubt; die Challenge zielt auf zugesetzten Zucker." },
      { question: "Was ist mit Honig oder Sirup?", answer: "Honig, Sirup und aehnliche Suessungsmittel gelten als zugesetzter Zucker." }
    ],
    benefits: [
      {
        title: "Klare Essensregeln koennen Verhalten vereinfachen.",
        text: "Randomisierte Studien zu Zeitfenstern und Kalorienreduktion zeigen: einfache, durchhaltbare Essensregeln koennen beim Gewichtsmanagement helfen, wenn sie zu geringerer Energieaufnahme fuehren.",
        source: sources.timeRestrictedEating
      }
    ],
    rules: ["Zugesetzter Zucker ist tabu.", "Obst ist erlaubt.", "Pruefe Zutatenlisten vor dem Kauf."]
  },
  {
    title: "Marathon unter 3 Stunden",
    slug: "marathon-unter-3-stunden",
    level: "Premium",
    participants: 0,
    rating: 3.9,
    createdAt: "2023-11-03",
    duration: "Einmalig",
    goal: "Einen offiziellen Marathon in unter 3 Stunden finishen.",
    description: "Eine ambitionierte Ausdauer-Challenge fuer erfahrene Laeuferinnen und Laeufer mit strukturiertem Training.",
    seoDescription: "Marathon unter 3 Stunden: anspruchsvolle Lauf-Challenge mit Ziel, Regeln und Trainingsfokus.",
    tips: ["Nutze einen strukturierten Trainingsplan.", "Teste Verpflegung und Pace vor dem Wettkampf.", "Plane Regeneration so ernst wie harte Einheiten."],
    faq: [
      { question: "Zaehlt ein Trainingslauf?", answer: "Fuer diese Challenge zaehlt ein offizielles Rennen mit messbarer Zeit." },
      { question: "Welche Pace brauche ich?", answer: "Du brauchst im Schnitt schneller als etwa 4:16 Minuten pro Kilometer." }
    ],
    benefits: [
      {
        title: "Ausdauerziele machen Training messbar.",
        text: "Schritt- und Aktivitaetsdaten zeigen konsistent, dass mehr alltaegliche Bewegung mit besseren Gesundheitsoutcomes zusammenhaengt.",
        source: sources.stepsMortality
      }
    ],
    rules: ["Die Zeit muss aus einem offiziellen Rennen stammen.", "Die Distanz betraegt 42,195 km.", "Gesundheit und Regeneration haben Prioritaet."]
  },
  {
    title: "1.000 Liegestütze Challenge",
    slug: "1000-liegestuetze-challenge",
    level: "Premium",
    participants: 0,
    rating: 2.1,
    createdAt: "2023-11-18",
    duration: "Einmalig",
    goal: "1.000 Liegestütze an einem Tag absolvieren.",
    description: "Ein grosser Tagesblock fuer Kraftausdauer, Planung und saubere Einteilung.",
    seoDescription: "1.000 Liegestütze Challenge: Ziel, Tagesstrategie, Regeln und Tipps für Kraftausdauer.",
    tips: ["Plane kleine Saetze mit festen Pausen.", "Starte deutlich leichter als du dich fuehlst.", "Schuetze Handgelenke, Schultern und Ellbogen."],
    faq: [
      { question: "Darf ich die Liegestütze aufteilen?", answer: "Ja, alle Wiederholungen dürfen über den Tag verteilt werden." },
      { question: "Zaehlen unsaubere Wiederholungen?", answer: "Nein, nur kontrollierte Wiederholungen sollten gezaehlt werden." }
    ],
    benefits: [
      {
        title: "Kraftausdauer baut Belastbarkeit auf.",
        text: "Muskelstaerkende Aktivitaeten wurden in einer Meta-Analyse mit reduziertem Risiko fuer Gesamtsterblichkeit und chronische Erkrankungen assoziiert.",
        source: sources.strengthMortality
      }
    ],
    rules: ["Die Wiederholungen duerfen in Saetze aufgeteilt werden.", "Alle Wiederholungen muessen an einem Kalendertag erfolgen.", "Saubere Technik geht vor Tempo."]
  },
  {
    title: "100 Tage ohne soziale Medien",
    slug: "100-tage-ohne-soziale-medien",
    level: "Advanced",
    participants: 0,
    rating: 4.6,
    createdAt: "2024-01-05",
    duration: "Zeitraum",
    goal: "100 Tage lang keine Social-Media-Apps privat nutzen.",
    description: "Mehr Fokus, weniger Ablenkung und ein bewussterer Umgang mit digitaler Aufmerksamkeit.",
    seoDescription: "100 Tage ohne soziale Medien: Digital-Detox-Challenge mit Regeln, Tipps und Fokus auf neue Routinen.",
    tips: ["Entferne Apps vom Homescreen oder deinstalliere sie.", "Lege Ersatzroutinen fuer Pausen fest.", "Schreibe auf, welche Ausloeser dich normalerweise oeffnen lassen."],
    faq: [
      { question: "Zaehlt berufliche Nutzung als Rueckfall?", answer: "Nicht, wenn sie vorher klar begrenzt und notwendig ist." },
      { question: "Was mache ich bei Langeweile?", answer: "Plane vorher einfache Alternativen wie Lesen, Spaziergang oder kurze Aufgaben." }
    ],
    benefits: [
      {
        title: "Vorher festgelegte Wenn-Dann-Regeln helfen beim Durchhalten.",
        text: "Meta-Analysen zu Implementation Intentions zeigen, dass konkrete Wenn-Dann-Plaene Zielverhalten unterstuetzen koennen.",
        source: sources.implementationIntentions
      }
    ],
    rules: ["Social-Media-Apps bleiben deinstalliert oder blockiert.", "Berufliche Pflichtnutzung wird vorher klar begrenzt.", "Notiere, was du mit der gewonnenen Zeit machst."]
  },
  {
    title: "30 Tage Kaltwasser-Duschen",
    slug: "30-tage-kaltwasser-duschen",
    level: "Advanced",
    participants: 0,
    rating: 2.6,
    createdAt: "2024-02-12",
    duration: "Zeitraum",
    goal: "30 Tage lang jede Dusche kalt beenden.",
    description: "Eine kurze, unangenehme und sehr klare Disziplin-Challenge fuer den Start in den Tag.",
    seoDescription: "30 Tage Kaltwasser-Duschen: Challenge-Ziel, Regeln und Tipps fuer einen kontrollierten Einstieg.",
    tips: ["Beginne mit kurzen Intervallen.", "Atme ruhig und gleichmaessig.", "Waehle eine feste Tageszeit."],
    faq: [
      { question: "Muss die ganze Dusche kalt sein?", answer: "Nein, die Challenge verlangt mindestens den kalten Abschluss." },
      { question: "Ist das fuer jeden geeignet?", answer: "Nicht unbedingt; bei gesundheitlichen Fragen solltest du vorsichtig sein." }
    ],
    benefits: [
      {
        title: "Kurze Routinen trainieren Verbindlichkeit.",
        text: "Konkrete Wenn-Dann-Plaene koennen helfen, aus Absichten tatsaechliches Verhalten zu machen.",
        source: sources.implementationIntentions
      }
    ],
    rules: ["Beende jede Dusche mit mindestens 60 Sekunden kaltem Wasser.", "Ueberspringe keine Tage.", "Hoere auf deinen Koerper und uebertreibe nicht."]
  },
  {
    title: "1 Jahr ohne Social Media",
    slug: "1-jahr-ohne-social-media",
    level: "Premium",
    participants: 0,
    rating: 4.9,
    createdAt: "2024-03-22",
    duration: "Dauerhaft",
    goal: "Ein volles Jahr auf private Social-Media-Nutzung verzichten.",
    description: "Die Langstrecken-Version fuer alle, die Aufmerksamkeit, Freizeit und Gewohnheiten neu ordnen wollen.",
    seoDescription: "1 Jahr ohne Social Media: langfristige Digital-Detox-Challenge mit Ziel, Regeln und Reflexionsideen.",
    tips: ["Informiere wichtige Kontakte ueber alternative Wege.", "Blockiere Gewohnheitszugriffe technisch.", "Pruefe monatlich, was sich verbessert hat."],
    faq: [
      { question: "Sind Messenger erlaubt?", answer: "Das haengt von deiner Definition ab; lege die erlaubten Dienste vor dem Start fest." },
      { question: "Was passiert bei einem Rueckfall?", answer: "Dokumentiere ihn ehrlich und entscheide, ob du neu startest oder weiterzaehlst." }
    ],
    benefits: [
      {
        title: "Langfristige Regeln reduzieren taegliche Reibung.",
        text: "Implementation-Intention-Forschung stuetzt die Idee, konkrete Regeln und Ausloeser vorab zu definieren, statt jeden Tag neu zu verhandeln.",
        source: sources.implementationIntentions
      }
    ],
    rules: ["Definiere vorab, welche Dienste tabu sind.", "Nutze keine Ausweichaccounts.", "Reflektiere monatlich deine Veraenderungen."]
  },
  {
    title: "500 kg Kreuzheben",
    slug: "500-kg-kreuzheben",
    level: "Premium",
    participants: 0,
    rating: 4.0,
    createdAt: "2024-04-09",
    duration: "Einmalig",
    goal: "500 kg im Kreuzheben bewegen.",
    description: "Eine extreme Kraft-Challenge, die nur fuer sehr erfahrene Athletinnen und Athleten gedacht ist.",
    seoDescription: "500 kg Kreuzheben als extreme Kraft-Challenge: Ziel, Sicherheitsregeln und Trainingshinweise.",
    tips: ["Trainiere nur mit sehr erfahrenem Coaching.", "Priorisiere Technik, Belastungssteuerung und Regeneration.", "Plane keine Maximalversuche ohne Vorbereitung."],
    faq: [
      { question: "Ist die Challenge fuer Einsteiger geeignet?", answer: "Nein, diese Challenge ist extrem fortgeschritten." },
      { question: "Was ist wichtiger als das Gewicht?", answer: "Sichere Ausfuehrung, Gesundheit und langfristige Belastbarkeit." }
    ],
    benefits: [
      {
        title: "Schwere Kraftziele brauchen langfristige Muskelentwicklung.",
        text: "Krafttraining ist in Beobachtungsdaten mit Gesundheitsvorteilen verbunden; extreme Maximalziele gehoeren aber nur in erfahrene, sicher betreute Trainingsprozesse.",
        source: sources.strengthMortality
      }
    ],
    rules: ["Nur mit sicherem Setup und fachlicher Begleitung trainieren.", "Die Ausfuehrung muss kontrolliert sein.", "Gesundheit steht ueber Rekordversuchen."]
  },
  {
    title: "10.000 Kalorien-Challenge",
    slug: "10000-kalorien-challenge",
    level: "Premium",
    participants: 0,
    rating: 2.2,
    createdAt: "2024-05-16",
    duration: "Einmalig",
    goal: "An einem Tag 10.000 Kalorien essen.",
    description: "Eine sehr spezielle Food-Challenge, bei der Planung und persoenliche Grenzen besonders wichtig sind.",
    seoDescription: "10.000 Kalorien-Challenge: Ziel, Regeln und Hinweise fuer eine extreme Food-Challenge.",
    tips: ["Plane Lebensmittel vorher statt spontan zu essen.", "Achte auf Wasser und Pausen.", "Setze Gesundheit klar vor das Ziel."],
    faq: [
      { question: "Ist diese Challenge gesund?", answer: "Sie ist extrem und nicht fuer jede Person geeignet." },
      { question: "Darf ich abbrechen?", answer: "Ja, bei Unwohlsein solltest du sofort abbrechen." }
    ],
    benefits: [
      {
        title: "Eher Entertainment als Gesundheitsziel.",
        text: "Fuer nachhaltige Koerperveraenderung ist eine durchhaltbare Energie- und Essensstruktur wichtiger als extreme Einzeltage.",
        source: sources.timeRestrictedEating
      }
    ],
    rules: ["Nur teilnehmen, wenn gesundheitlich unbedenklich.", "Trinke ausreichend Wasser.", "Brich ab, wenn du dich schlecht fuehlst."]
  },
  {
    title: "10min am Stück planken Challenge",
    slug: "10min-am-stueck-planken-challenge",
    level: "Premium",
    participants: 0,
    rating: 3.2,
    createdAt: "2024-06-01",
    duration: "Einmalig",
    goal: "10 Minuten ohne Unterbrechung in der Plank halten.",
    description: "Eine Core-Challenge fuer Koerperspannung, Geduld und ruhige Atmung.",
    seoDescription: "10 Minuten Plank Challenge: Ziel, Regeln und Tipps fuer Koerperspannung und Core-Ausdauer.",
    tips: ["Trainiere mit Intervallen und steigere langsam.", "Halte Nacken und Ruecken neutral.", "Nutze ruhige Atmung als Taktgeber."],
    faq: [
      { question: "Zaehlt ein kurzer Positionswechsel?", answer: "Nein, die Plank soll ohne Unterbrechung gehalten werden." },
      { question: "Was tun bei Schmerzen?", answer: "Bei Schmerzen solltest du abbrechen und Technik oder Belastung pruefen." }
    ],
    benefits: [
      {
        title: "Core-Training ist Teil muskelstaerkender Aktivitaet.",
        text: "Muskelstaerkende Aktivitaeten sind in Studien mit niedrigerem Risiko fuer mehrere grosse Krankheitsgruppen verbunden.",
        source: sources.strengthMortality
      }
    ],
    rules: ["Unterarme und Zehen bleiben am Boden.", "Huefte bleibt stabil.", "Bei Schmerz abbrechen."]
  },
  {
    title: "5 km in weniger als 20 Minuten",
    slug: "5-km-in-weniger-als-20-minuten",
    level: "User",
    participants: 1,
    rating: 0.0,
    createdAt: "2024-06-18",
    duration: "Einmalig",
    goal: "5 Kilometer in unter 20 Minuten laufen.",
    description: "Eine knackige Lauf-Challenge fuer Tempo, Pacing und kontrolliertes Training.",
    seoDescription: "5 km unter 20 Minuten laufen: Challenge-Ziel, Pace, Regeln und Tipps fuer schnelleres Laufen.",
    tips: ["Trainiere Tempoeinheiten und lockere Laeufe getrennt.", "Teste Zielpace in kuerzeren Intervallen.", "Starte den Versuch nicht ohne Warm-up."],
    faq: [
      { question: "Welche Pace brauche ich?", answer: "Du musst schneller als 4:00 Minuten pro Kilometer laufen." },
      { question: "Zaehlt Laufband?", answer: "Die Challenge ist am klarsten auf einer gemessenen Strecke; Laufband sollte getrennt markiert werden." }
    ],
    benefits: [
      {
        title: "Laufziele verbinden Fitness und Messbarkeit.",
        text: "Mehr taegliche Bewegung ist mit geringerer Gesamtsterblichkeit verbunden; strukturierte Laufziele koennen ein starker Anlass fuer regelmaessiges Training sein.",
        source: sources.stepsMortality
      }
    ],
    rules: ["Die Strecke muss mindestens 5 km lang sein.", "Die Zeit muss unter 20:00 Minuten liegen.", "Warm-up und Cool-down gehoeren dazu."]
  },
  {
    title: "Change your life in 90 Tagen",
    slug: "change-your-life-in-90-tagen",
    level: "Premium",
    participants: 0,
    rating: 0.0,
    createdAt: "2024-07-01",
    duration: "90 Tage",
    goal: "90 Tage lang Koerper, Fokus, Schlaf und Lernen gleichzeitig auf ein neues Level bringen.",
    description: "Eine Meta-Challenge aus mehreren Kerngewohnheiten: Fett verlieren, Kraft aufbauen, fokussiert arbeiten, ausreichend schlafen und taeglich etwas lernen.",
    seoDescription: "Change your life in 90 Tagen: kombinierte Challenge fuer Abnehmen, Kraftaufbau, Fokusarbeit, Schlaf und taegliches Lernen mit wissenschaftlichen Quellen.",
    tips: [
      "Starte klein genug, dass du die Routine auch an stressigen Tagen halten kannst.",
      "Tracke nur die wichtigsten 5 Gewohnheiten, nicht dein ganzes Leben.",
      "Plane jede Woche eine echte Erholungsphase ein."
    ],
    faq: [
      { question: "Ist das eine Hustle-Culture-Challenge?", answer: "Nicht im Sinne von endlos arbeiten. Der Fokus liegt auf Output, Schlaf, Training und Lernen in Balance." },
      { question: "Muss ich alle Teilbereiche perfekt schaffen?", answer: "Nein. Ziel ist ein 90-Tage-System, das mehr gute Tage erzeugt als schlechte." }
    ],
    benefits: [
      {
        title: "Mehr Bewegung und Schritte koennen langfristig Gesundheit unterstuetzen.",
        text: "Die Schritte-Meta-Analyse fand eine Verbindung zwischen hoeherer Schrittzahl und niedrigerer Gesamtsterblichkeit.",
        source: sources.stepsMortality
      },
      {
        title: "Krafttraining ist ein eigener Gesundheitshebel.",
        text: "Muskelstaerkende Aktivitaeten waren in einer Meta-Analyse mit niedrigerem Risiko fuer Gesamtsterblichkeit und mehrere Erkrankungen assoziiert.",
        source: sources.strengthMortality
      },
      {
        title: "Schlaf ist Teil der Performance, nicht der Gegner davon.",
        text: "Die AASM und Sleep Research Society empfehlen Erwachsenen regelmaessig mindestens 7 Stunden Schlaf fuer optimale Gesundheit.",
        source: sources.sleepConsensus
      },
      {
        title: "Lernen braucht Schlaf und Wiederholung.",
        text: "Eine systematische Review beschreibt Schlaf als wichtigen Faktor fuer Konsolidierung, Verarbeitung und Funktion von Lernen und Gedächtnis.",
        source: sources.sleepLearning
      },
      {
        title: "Hustle braucht Grenzen.",
        text: "WHO/ILO-Analysen verbinden sehr lange Arbeitszeiten mit hoeheren Risiken fuer Schlaganfall und ischaemische Herzkrankheit; deshalb setzt die Challenge auf Fokus statt Dauerstress.",
        source: sources.longHours
      }
    ],
    stack: [
      { title: "Abnehmen", text: "Taegliches Schrittziel, einfache Protein-/Gemuese-Regel und ein realistisches Kaloriendefizit." },
      { title: "Kraftaufbau", text: "3 Krafttrainings pro Woche mit Grundmustern: Druecken, Ziehen, Beine, Core." },
      { title: "Fokusarbeit", text: "5 fokussierte Arbeitsbloecke pro Woche fuer ein persoenliches Projekt oder Business-Ziel." },
      { title: "Schlaf", text: "7+ Stunden Schlaf als Mindeststandard, weil Regeneration Teil des Systems ist." },
      { title: "Taeglich lernen", text: "20 Minuten Lesen, Kurs, Sprache, Skill oder schriftliche Reflexion pro Tag." }
    ],
    plan: {
      title: "90-Tage-Plan",
      intro: "Die Challenge ist in drei Phasen aufgebaut: Stabilisieren, Steigern, Identitaet festigen.",
      weeks: [
        { label: "Tag 1-14", focus: "Baseline und einfache Siege", tasks: ["8.000 Schritte pro Tag.", "2 Krafttrainings pro Woche.", "7 Stunden Schlaf an mindestens 5 Naechten.", "10 Minuten Lernen pro Tag."] },
        { label: "Tag 15-42", focus: "System aufbauen", tasks: ["10.000 Schritte pro Tag.", "3 Krafttrainings pro Woche.", "3 Fokusbloecke pro Woche.", "20 Minuten Lernen pro Tag."] },
        { label: "Tag 43-70", focus: "Intensitaet steigern", tasks: ["Progression im Krafttraining dokumentieren.", "5 Fokusbloecke pro Woche.", "Eine schlechte Gewohnheit aktiv ersetzen.", "Woechentlicher Review am Sonntag."] },
        { label: "Tag 71-90", focus: "Neues Normal festigen", tasks: ["Keine neuen Regeln mehr hinzufuegen.", "Beste 3 Gewohnheiten fuer danach auswaehlen.", "Vorher/Nachher-Review schreiben.", "Naechste 90 Tage planen."] }
      ]
    },
    rules: [
      "Tracke taeglich Schritte, Training, Schlaf, Fokusblock und Lernen.",
      "Mindestens 80 Prozent der Tage muessen erfolgreich sein.",
      "Kein Schlaf gegen Hustle tauschen: unter 6 Stunden Schlaf zaehlt als Warnsignal.",
      "Ein woechentlicher Review ist Pflicht."
    ]
  }
];

export const levelLabels: Record<ChallengeLevel, string> = {
  User: "User Challenge",
  Beginner: "Beginner Challenge",
  Advanced: "Advanced Challenge",
  Premium: "Premium Challenge"
};

export function getChallengeBySlug(slug: string) {
  return challenges.find((challenge) => challenge.slug === slug);
}
