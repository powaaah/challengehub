import fs from "node:fs";
import path from "node:path";

/** Named plain-text slots keep the existing page layout and interactive elements. */
export function parsePageMarkdown(source: string, filename = "Seite"): Record<string, string> {
  const normalized = source.replace(/\r\n/g, "\n").replace(/<!--[\s\S]*?-->/g, "");
  if (!/^# [^\n]+\n/.test(normalized)) throw new Error(`${filename}: Seitentitel (#) fehlt.`);
  const sections = normalized.split(/^## /m).slice(1);
  if (!sections.length) throw new Error(`${filename}: Textabschnitte fehlen.`);
  const result: Record<string, string> = Object.create(null);
  for (const section of sections) {
    const newline = section.indexOf("\n");
    const key = section.slice(0, newline).trim();
    const text = section.slice(newline + 1).trim().replace(/\s*\n\s*/g, " ");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key) || Object.hasOwn(result, key))
      throw new Error(`${filename}: Ungültiger oder doppelter Abschnitt "${key}".`);
    if (!text) throw new Error(`${filename}: Abschnitt "${key}" ist leer.`);
    result[key] = text;
  }
  return result;
}

export function loadPageFiles(directory: string) {
  return Object.fromEntries(
    fs.readdirSync(directory).filter((name) => name.endsWith(".md")).sort().map((name) => {
      const slug = name.slice(0, -3);
      if (!/^[a-z][a-z0-9-]*$/.test(slug)) throw new Error(`Ungültiger Seitenname: ${name}`);
      return [slug, parsePageMarkdown(fs.readFileSync(path.join(directory, name), "utf8"), name)];
    }),
  );
}
