export type HabitArticleSource = {
  label: string;
  url: string;
};

export type HabitArticleSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

export type HabitArticle = {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  publishedAt: string;
  excerpt: string;
  seoDescription: string;
  sources: HabitArticleSource[];
  sections: HabitArticleSection[];
  takeaways: string[];
};

export const habitArticles: HabitArticle[] = [
  {
    title: "Die 7 Habit Rules fuer Challenges",
    slug: "habit-rules-fuer-challenges",
    category: "Grundlagen",
    readTime: "7 min",
    publishedAt: "2026-06-03",
    excerpt: "Warum eine Challenge leichter durchzuhalten ist, wenn sie klein startet, sichtbar ist und eine klare Belohnung hat.",
    seoDescription: "Die wichtigsten Habit Rules fuer Challenges: Ausloeser, kleine Schritte, Belohnung, Umgebung, Identitaet und Wenn-Dann-Plaene.",
    sources: [
      { label: "Atomic Habits von James Clear", url: "https://jamesclear.com/atomic-habits" },
      { label: "Tiny Habits von BJ Fogg", url: "https://www.bjfogg.com/tiny-habits" },
      { label: "The Power of Habit von Charles Duhigg", url: "https://charlesduhigg.com/the-power-of-habit/" },
      { label: "Good Habits, Bad Habits von Wendy Wood", url: "https://us.macmillan.com/books/9781250159083/goodhabitsbadhabits/" }
    ],
    takeaways: [
      "Eine Challenge braucht einen sichtbaren Ausloeser.",
      "Die erste Version muss so leicht sein, dass du sie auch an schlechten Tagen schaffst.",
      "Belohnung und Fortschritt muessen sofort spuerbar sein.",
      "Deine Umgebung gewinnt oft gegen reine Willenskraft.",
      "Eine gute Challenge beantwortet: Wer werde ich dadurch?"
    ],
    sections: [
      {
        heading: "1. Mach den Ausloeser sichtbar",
        body: [
          "Viele Gewohnheiten scheitern nicht an Faulheit, sondern daran, dass sie im Alltag nicht auftauchen. Wenn du eine Challenge starten willst, braucht sie einen klaren Trigger: nach dem Zaehneputzen, nach dem Kaffee, direkt nach Feierabend oder vor dem ersten Scrollen am Handy.",
          "Charles Duhigg beschreibt Gewohnheiten als Schleife aus Ausloeser, Routine und Belohnung. Fuer ChallengeHub heisst das: Jede Challenge sollte nicht nur ein Ziel haben, sondern einen konkreten Moment, an dem sie beginnt."
        ],
        bullets: ["Schuhe sichtbar an die Tuer stellen.", "Lernbuch auf den Schreibtisch legen.", "Workout-Kleidung am Vorabend bereitlegen."]
      },
      {
        heading: "2. Starte kleiner als dein Ego will",
        body: [
          "BJ Fogg macht in Tiny Habits stark, dass Verhalten leichter startet, wenn es klein genug ist. Nicht: Ich trainiere jeden Tag eine Stunde. Sondern: Ich mache nach dem Kaffee zwei Liegestuetze. Die kleine Version wirkt unspektakulaer, aber sie entfernt Reibung.",
          "Eine Challenge darf ambitioniert sein. Der Einstieg sollte trotzdem winzig sein, damit du Momentum bekommst."
        ]
      },
      {
        heading: "3. Mach Fortschritt sofort sichtbar",
        body: [
          "Menschen wiederholen Verhalten eher, wenn es sich direkt sinnvoll oder belohnend anfuehlt. Darum funktionieren Streaks, Fortschrittsbalken und abgehakte Tagesfelder so gut.",
          "Bei ChallengeHub sollte jede Challenge langfristig trackbar sein: erledigt, nicht erledigt, Serie, persoenlicher Rekord, naechster Meilenstein."
        ]
      },
      {
        heading: "4. Baue Umgebung statt Willenskraft",
        body: [
          "Wendy Wood betont, wie stark Gewohnheiten an Kontext und Umgebung haengen. Wenn die Umgebung gegen dich arbeitet, brauchst du jeden Tag neue Disziplin. Wenn sie fuer dich arbeitet, wird das richtige Verhalten wahrscheinlicher.",
          "Eine gute Challenge sollte daher immer eine Umgebungsregel haben: Was lege ich bereit? Was entferne ich? Was mache ich schwerer?"
        ]
      },
      {
        heading: "5. Nutze Wenn-Dann-Plaene",
        body: [
          "Wenn-Dann-Plaene machen aus einem Vorsatz eine konkrete Reaktion. Beispiel: Wenn ich nach der Arbeit nach Hause komme, ziehe ich sofort Laufschuhe an. Das nimmt dir die Verhandlung mit dir selbst ab.",
          "Fuer Challenges ist das Gold: Je klarer die Situation und die Reaktion, desto weniger brauchst du Motivation."
        ],
        bullets: ["Wenn ich mein Handy entsperre, trinke ich zuerst Wasser.", "Wenn ich den Laptop zuklappe, gehe ich 10 Minuten raus.", "Wenn ich Heisshunger bekomme, esse ich zuerst Protein oder Obst."]
      },
      {
        heading: "6. Koppel die Challenge an Identitaet",
        body: [
          "Atomic-Habits-Logik ist nicht nur: Was will ich erreichen? Sondern: Welche Art Mensch werde ich? Eine Lauf-Challenge ist staerker, wenn sie nicht nur 5 km unter 20 Minuten verspricht, sondern dich als Laeufer denken laesst.",
          "Darum sollten Challenge-Seiten nicht nur Ziele zeigen, sondern auch eine Identitaetsformel: Diese Challenge ist fuer Menschen, die..."
        ]
      },
      {
        heading: "7. Plane den Neustart vor dem Rueckfall",
        body: [
          "Rueckfaelle sind normal. Gefaehrlich ist nicht ein verpasster Tag, sondern der zweite und dritte. Eine gute Habit Rule lautet: Nie zweimal hintereinander ausfallen lassen.",
          "Jede Challenge sollte eine Wiederaufnahme-Regel haben. So bleibt sie menschlich und trotzdem verbindlich."
        ]
      }
    ]
  },
  {
    title: "Tiny Habits: Warum kleine Versionen grosse Challenges retten",
    slug: "tiny-habits-challenges",
    category: "Methode",
    readTime: "5 min",
    publishedAt: "2026-06-03",
    excerpt: "Die kleinste Version einer Challenge ist oft nicht peinlich, sondern strategisch klug.",
    seoDescription: "Tiny Habits fuer Challenges: Wie kleine Gewohnheiten, Prompts und direkte Belohnung grosse Ziele leichter starten lassen.",
    sources: [
      { label: "BJ Fogg Tiny Habits", url: "https://www.bjfogg.com/tiny-habits" },
      { label: "Fogg Behavior Model", url: "https://www.behaviormodel.org/" },
      { label: "Implementation Intentions Meta-Analysis", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8149892/" }
    ],
    takeaways: [
      "Motivation schwankt, Design bleibt.",
      "Ein Verhalten braucht Motivation, Faehigkeit und Prompt.",
      "Die Tiny-Version ist der Startpunkt, nicht das Endziel.",
      "Direkte positive Rueckmeldung macht Wiederholung wahrscheinlicher."
    ],
    sections: [
      {
        heading: "Das Problem mit grossen Starts",
        body: [
          "Viele Menschen starten Challenges zu gross. Am ersten Tag ist Motivation da, am dritten Tag kommt Alltag dazwischen. Tiny Habits dreht die Frage um: Wie klein muss die Handlung sein, damit sie fast immer machbar ist?",
          "Aus 100 Liegestuetzen wird: nach dem Kaffee zwei Liegestuetze. Aus 10.000 Schritten wird: nach dem Mittagessen 7 Minuten gehen."
        ]
      },
      {
        heading: "Motivation ist kein Betriebssystem",
        body: [
          "Das Fogg Behavior Model beschreibt Verhalten als Zusammenspiel aus Motivation, Faehigkeit und Prompt. Wenn Motivation niedrig ist, muss die Handlung leichter sein. Wenn der Prompt fehlt, passiert gar nichts.",
          "ChallengeHub kann daraus spaeter sehr praktische UX bauen: jede Challenge fragt nach deinem Ausloeser und nach der kleinsten Version."
        ]
      },
      {
        heading: "So wird eine Challenge tiny",
        body: [
          "Die Tiny-Version ist nicht das Ziel. Sie ist der Einstieg. Sobald du die Gewohnheit stabil triffst, kannst du die Intensitaet erhoehen."
        ],
        bullets: ["Original: Jeden Tag 60 Minuten lernen. Tiny: Eine Karteikarte nach dem Kaffee.", "Original: 100 Burpees pro Tag. Tiny: 5 Burpees nach dem Zaehneputzen.", "Original: 10.000 Schritte. Tiny: 5 Minuten direkt nach dem Mittagessen gehen."]
      }
    ]
  },
  {
    title: "Cue, Routine, Reward: Die Habit Loop fuer ChallengeHub",
    slug: "cue-routine-reward-challengehub",
    category: "Framework",
    readTime: "6 min",
    publishedAt: "2026-06-03",
    excerpt: "Wie Ausloeser, Routine und Belohnung aus einem Ziel eine wiederholbare Challenge machen.",
    seoDescription: "Cue, Routine, Reward fuer Challenges: So wird aus einem Ziel eine Gewohnheit mit Trigger, Aktion und Belohnung.",
    sources: [
      { label: "The Power of Habit von Charles Duhigg", url: "https://charlesduhigg.com/the-power-of-habit/" },
      { label: "Good Habits, Bad Habits von Wendy Wood", url: "https://us.macmillan.com/books/9781250159083/goodhabitsbadhabits/" },
      { label: "Self-Regulation Mechanisms Meta-Review", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7571594/" }
    ],
    takeaways: [
      "Jede Challenge braucht einen Startreiz.",
      "Die Routine muss konkret beobachtbar sein.",
      "Belohnung sollte schnell und ehrlich sein.",
      "Umgebung entscheidet, ob die Loop leicht oder schwer wird."
    ],
    sections: [
      {
        heading: "Cue: Wann startet die Challenge?",
        body: [
          "Ein Ziel ohne Ausloeser bleibt abstrakt. Ein Ausloeser macht es operational: nach dem Aufstehen, nach dem Abendessen, bevor du Social Media oeffnest.",
          "Je genauer der Cue, desto weniger musst du entscheiden."
        ]
      },
      {
        heading: "Routine: Was genau wird getan?",
        body: [
          "Eine Routine muss messbar sein. Nicht: gesuender leben. Sondern: 30 Minuten spazieren, 3 Saetze Liegestuetze, 20 Minuten lesen.",
          "ChallengeHub sollte Routinen deshalb als klare Tagesaufgaben denken."
        ]
      },
      {
        heading: "Reward: Warum wiederholen?",
        body: [
          "Belohnung muss nicht Schokolade oder Shopping sein. Sie kann auch ein sichtbarer Fortschritt, ein Streak, ein Haken oder ein kleines Gefuehl von Stolz sein.",
          "Wichtig ist: Das Gehirn braucht ein Signal, dass sich die Wiederholung lohnt."
        ]
      },
      {
        heading: "So koennte ChallengeHub daraus Produktlogik machen",
        body: [
          "Langfristig koennte jede Challenge ein kleines Habit-Setup haben: Cue festlegen, Tiny-Version definieren, Tracking aktivieren, Neustart-Regel setzen.",
          "Damit waere ChallengeHub nicht nur eine Liste von Zielen, sondern ein System fuer Verhalten."
        ],
        bullets: ["Cue: Wann mache ich es?", "Routine: Was genau mache ich?", "Reward: Was sehe/spuere ich direkt danach?", "Fallback: Was ist die kleinste Version an schlechten Tagen?"]
      }
    ]
  }
];

export function getHabitArticleBySlug(slug: string) {
  return habitArticles.find((article) => article.slug === slug);
}
