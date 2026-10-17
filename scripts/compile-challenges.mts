import fs from "node:fs";
import path from "node:path";
import { loadChallengeFiles } from "../lib/challenge-markdown.ts";
const challenges = loadChallengeFiles(path.resolve("content/challenges"));
for (const challenge of challenges)
  if (!fs.existsSync(`public/images/challenges/${challenge.header.image}.jpg`))
    throw new Error(`Bild fehlt: ${challenge.slug}`);
const output =
  "// Generated from content/challenges/*.md. Do not edit.\nexport const generatedChallenges = " +
  JSON.stringify(challenges, null, 2) +
  ";\n";
const target = "data/challenges.generated.ts";
if (process.argv.includes("--check")) {
  if (
    !fs.existsSync(target) ||
    fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n") !== output
  )
    throw new Error(
      "Markdown und generierter Katalog unterscheiden sich. npm run content:build ausführen.",
    );
} else if (
  !fs.existsSync(target) ||
  fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n") !== output
) {
  fs.writeFileSync(target + ".tmp", output);
  fs.renameSync(target + ".tmp", target);
}
console.log(
  `${challenges.length} Challenge-Dateien geprüft${process.argv.includes("--check") ? "" : " und kompiliert"}.`,
);
