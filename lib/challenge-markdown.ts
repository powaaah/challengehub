import fs from "node:fs";
import path from "node:path";
import { parseChallengeDefinition } from "../domain/challenges/challenge-definition.ts";
import type { Challenge } from "../data/challenges.ts";
import type { ChallengeHeaderContent } from "../data/challenge-headers.ts";

export type FileChallenge = Challenge & {
  id: string;
  order: number;
  header: ChallengeHeaderContent;
  seoMarkdown: string;
};
const sections = [
  "Ziel",
  "Beschreibung",
  "SEO-Beschreibung",
  "Regeln",
  "Tipps",
  "FAQ",
];
const text = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
export function parseChallengeMarkdown(
  source: string,
  filename: string,
): FileChallenge {
  const fail = (message: string): never => {
    throw new Error(`${filename}: ${message}`);
  };
  const match = source
    .replace(/\r\n/g, "\n")
    .match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return fail("JSON-Kopf zwischen --- fehlt.");
  let meta: Record<string, unknown>;
  try {
    meta = JSON.parse(match[1]);
  } catch {
    return fail("Ungültiges JSON im Dateikopf.");
  }
  if (!meta || Array.isArray(meta) || typeof meta !== "object")
    return fail("Dateikopf muss ein Objekt sein.");
  if (!text(meta.id) || !/^curated:[a-z0-9][a-z0-9-]*$/.test(meta.id))
    fail("Feste ID im Format curated:kennung erforderlich.");
  if (!text(meta.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug))
    fail("Ungültiger Slug.");
  for (const key of ["title", "createdAt", "duration"])
    if (!text(meta[key])) fail(`${key} fehlt.`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(String(meta.createdAt)) ||
    !Number.isFinite(Date.parse(String(meta.createdAt))) ||
    new Date(String(meta.createdAt)).toISOString().slice(0, 10) !==
      meta.createdAt
  )
    fail("Ungültiges Datum.");
  if (!["User", "Beginner", "Advanced", "Premium"].includes(String(meta.level)))
    fail("Ungültiges Level.");
  for (const key of ["order", "participants", "rating"])
    if (
      typeof meta[key] !== "number" ||
      !Number.isFinite(meta[key]) ||
      (meta[key] as number) < 0
    )
      fail(`${key} muss eine nichtnegative Zahl sein.`);
  if ((meta.rating as number) > 5) fail("Bewertung darf maximal 5 sein.");
  const definition = parseChallengeDefinition(meta.definition);
  if (!definition) fail("Ungültige Wertungskonfiguration.");
  const header = meta.header as Record<string, unknown> | undefined;
  if (
    !header ||
    !["image", "alt", "summary", "highlight", "caption"].every((k) =>
      text(header[k]),
    )
  )
    fail("Bild und Headertexte fehlen.");
  if (!/^[a-z0-9-]+$/.test(String(header!.image)))
    fail("Bild muss ein lokaler Bildschlüssel sein.");
  if (
    meta.benefits !== undefined &&
    (!Array.isArray(meta.benefits) ||
      !meta.benefits.every(
        (b) =>
          b &&
          text(b.title) &&
          text(b.text) &&
          b.source &&
          text(b.source.label) &&
          /^https?:\/\//.test(b.source.url),
      ))
  )
    fail("Ungültige Quellen-/Nutzenliste.");
  if (
    meta.stack !== undefined &&
    (!Array.isArray(meta.stack) ||
      !meta.stack.every((s) => s && text(s.title) && text(s.text)))
  )
    fail("Ungültige Teil-Challenge-Beschreibungen.");
  const plan = meta.plan as
    | { title?: unknown; intro?: unknown; weeks?: unknown[] }
    | undefined;
  if (
    meta.plan !== undefined &&
    (!plan ||
      !text(plan.title) ||
      !text(plan.intro) ||
      !Array.isArray(plan.weeks) ||
      !plan.weeks.every((w) => {
        const row = w as {
          label?: unknown;
          focus?: unknown;
          tasks?: unknown[];
        };
        return (
          row &&
          text(row.label) &&
          text(row.focus) &&
          Array.isArray(row.tasks) &&
          row.tasks.every(text)
        );
      }))
  )
    fail("Ungültiger Trainingsplan.");
  const [body, ...seoParts] = match[2].split(/^## SEO-Text\s*$/m);
  if (seoParts.length !== 1 || !text(seoParts[0]))
    fail("Genau ein Abschnitt ## SEO-Text erforderlich.");
  if (!seoParts[0].trim().startsWith("## ") || /^# (?!#)/m.test(seoParts[0]))
    fail("SEO-Text muss mit ## beginnen; die Seite besitzt bereits eine H1.");
  const found = new Map<string, string>();
  const pattern = /^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm;
  for (const m of body.matchAll(pattern)) {
    if (!sections.includes(m[1]) || found.has(m[1]))
      fail(`Unbekannter oder doppelter Abschnitt: ${m[1]}`);
    found.set(m[1], m[2].trim());
  }
  for (const name of sections)
    if (!found.has(name)) fail(`Abschnitt ## ${name} fehlt.`);
  const list = (name: string) => {
    const lines = found
      .get(name)!
      .split("\n")
      .filter((l) => l.trim());
    if (
      !lines.length ||
      lines.some((l) => !l.startsWith("- ") || !l.slice(2).trim())
    )
      fail(`${name}: Bitte je Eintrag eine Zeile mit "- " verwenden.`);
    return lines.map((l) => l.slice(2).trim());
  };
  const faq = Array.from(
    found.get("FAQ")!.matchAll(/^### (.+)\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm),
  ).map((m) => ({ question: m[1].trim(), answer: m[2].trim() }));
  if (!faq.length || faq.some((f) => !f.answer))
    fail("FAQ benötigt Fragen als ### und Antworten.");
  for (const name of ["Ziel", "Beschreibung", "SEO-Beschreibung"])
    if (!text(found.get(name))) fail(`${name} darf nicht leer sein.`);
  return {
    ...meta,
    definition,
    goal: found.get("Ziel")!,
    description: found.get("Beschreibung")!,
    seoDescription: found.get("SEO-Beschreibung")!,
    rules: list("Regeln"),
    tips: list("Tipps"),
    faq,
    seoMarkdown: seoParts[0].trim(),
  } as FileChallenge;
}
export function loadChallengeFiles(directory: string): FileChallenge[] {
  if (!fs.existsSync(directory))
    throw new Error("Challenge-Verzeichnis fehlt. Abgleich abgebrochen.");
  const files: string[] = [];
  function walk(dir: string) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isSymbolicLink())
        throw new Error(`Keine symbolischen Links erlaubt: ${file}`);
      if (item.isDirectory()) walk(file);
      else if (item.name.endsWith(".md")) files.push(file);
    }
  }
  walk(directory);
  if (!files.length)
    throw new Error(
      "Keine Challenge-Dateien gefunden. Leeren Katalog nicht automatisch übernehmen.",
    );
  const challenges = files
    .sort()
    .map((file) => parseChallengeMarkdown(fs.readFileSync(file, "utf8"), file));
  for (const key of ["id", "slug"] as const) {
    const seen = new Set<string>();
    for (const c of challenges) {
      if (seen.has(c[key])) throw new Error(`Doppelter ${key}: ${c[key]}`);
      seen.add(c[key]);
    }
  }
  return challenges.sort(
    (a, b) => a.order - b.order || a.id.localeCompare(b.id),
  );
}
