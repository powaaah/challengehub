import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import test from "node:test";

const sourceRoots = ["app", "components", "data"];
const sourceExtensions = new Set([".ts", ".tsx"]);
const asciiGermanWords = /\b(?:aehnlich(?:e|en)?|ausfuellen|ausloeser|ausser|bestaetigt|bloecke|buecher|draussen|durchgefuehrt|duerfen|faehigkeit|fuehlen|fuehren|fuer|fussball|gehoeren|geniessen|geprueft|gross(?:e|en|er|es)?|gueltig(?:e|en)?|heisshunger|heisst|koennen|koerper(?:lich(?:e|en)?)?|laengst(?:e|en)|laeufer(?:innen)?|loeschkonzept|moeglich(?:e|en)?|muessen|oeffentlich(?:e|en)?|oeffnen|persoenlich(?:e|en)?|plaene|pruefen|pruefe|regelmaessig|rueckfall|rueckfaelle|saetze|schliessen|spaeter|staendig|strasse|suess|taeglich|ueber|uebersicht|ungueltig|verfuegbar|vorlaeufig(?:e|er)?|waehle|waehlt|weiss|zaehlt|zaehlen|zurueck)\b/giu;

test("deutsche Nutzertexte verwenden Umlaute und ß statt ASCII-Umschreibungen", () => {
  const violations: string[] = [];

  for (const filePath of sourceRoots.flatMap(collectSourceFiles)) {
    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

    lines.forEach((line, index) => {
      const userFacingPart = line
        .replace(/slug:\s*["'][^"']*["']/g, "")
        .replace(/href=["'][^"']*["']/g, "")
        .replace(/\.replaceAll\([^)]*\)/g, "")
        .replace(/teilnahme-bestaetigt/g, "")
        .replace(/const reason =.*$/g, "");
      const matches = [...userFacingPart.matchAll(asciiGermanWords)].map((match) => match[0]);

      if (matches.length > 0) {
        violations.push(`${relative(process.cwd(), filePath)}:${index + 1} (${matches.join(", ")})`);
      }
    });
  }

  assert.deepEqual(violations, [], `ASCII-Umschreibungen in Nutzertexten gefunden:\n${violations.join("\n")}`);
});

function collectSourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(path);
    }

    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}
