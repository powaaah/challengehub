import fs from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { spawnSync, spawn } from "node:child_process";
const require = createRequire(import.meta.url);
const mode = process.argv[2],
  args = process.argv.slice(3);
const hash = () =>
  createHash("sha256")
    .update(
      fs
        .readFileSync("data/challenges.generated.ts", "utf8")
        .replace(/\r\n/g, "\n"),
    )
    .digest("hex");
function run(script: string, extra: string[] = []) {
  const result = spawnSync(process.execPath, [script, ...extra], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (mode === "build") {
  run("scripts/compile-challenges.mts");
  run(require.resolve("next/dist/bin/next"), ["build", ...args]);
  fs.writeFileSync(".next/challenge-content.sha256", hash() + "\n");
} else if (mode === "start") {
  run("scripts/compile-challenges.mts", ["--check"]);
  if (
    !fs.existsSync(".next/challenge-content.sha256") ||
    fs.readFileSync(".next/challenge-content.sha256", "utf8").trim() !== hash()
  )
    throw new Error(
      "Challenge-Dateien passen nicht zum Produktionsbuild. Erst npm run build ausführen.",
    );
  run("scripts/sync-challenges.mts", ["--apply"]);
  const child = spawn(
    process.execPath,
    [require.resolve("next/dist/bin/next"), "start", ...args],
    { stdio: "inherit", env: process.env },
  );
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.on(signal, () => child.kill(signal));
  child.on("exit", (code) => process.exit(code ?? 1));
} else throw new Error("Expected build or start.");
