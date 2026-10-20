import fs from "node:fs";
import { loadPageFiles } from "../lib/page-markdown.ts";

const pages = loadPageFiles("content/pages");
// Validate every reference, including removed/renamed sections, before generating.
for (const [page, copy] of Object.entries(pages)) {
  const consumers = page === "startseite" || page === "challenges"
    ? ["components/challenge-hub-app.tsx"]
    : [`app/${page}/page.tsx`];
  for (const filename of consumers) {
    let source = fs.readFileSync(filename, "utf8");
    if (page === "startseite") source = source.split("type ChallengeCatalogAppProps")[0];
    if (page === "challenges") source = source.split("type ChallengeCatalogAppProps")[1];
    for (const match of source.matchAll(/copy\["([^"]+)"\]/g))
      if (!Object.hasOwn(copy, match[1])) throw new Error(`${page}.md: Abschnitt "${match[1]}" fehlt.`);
  }
}
for (const page of ["startseite", "challenges", "wissen", "impressum", "datenschutz", "sicherheit", "karriere"])
  if (!Object.hasOwn(pages, page)) throw new Error(`content/pages/${page}.md fehlt.`);
const output = "// Generated from content/pages/*.md. Do not edit.\nexport const pageContent = " +
  JSON.stringify(pages, null, 2) + " as const;\n";
const target = "data/pages.generated.ts";
const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n") : "";
if (process.argv.includes("--check")) {
  if (current !== output) throw new Error("Seitentexte sind nicht aktuell. npm run content:build ausführen.");
} else if (current !== output) {
  fs.writeFileSync(target + ".tmp", output);
  fs.renameSync(target + ".tmp", target);
}
console.log(`${Object.keys(pages).length} Markdown-Seiten geprüft${process.argv.includes("--check") ? "" : " und kompiliert"}.`);
