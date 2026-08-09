import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runInIsolatedE2EEnvironment } from "./e2e-environment.mjs";

const require = createRequire(import.meta.url);
const playwrightCli = require.resolve("@playwright/test/cli");

function assertIsolationSafeArguments(args) {
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const isConfigOverride = argument === "--config"
      || argument.startsWith("--config=")
      || argument.startsWith("-c");
    const isOutputOverride = argument === "--output"
      || argument.startsWith("--output=");

    let workerValue = null;
    if (argument === "--workers" || argument === "-j") {
      workerValue = args[index + 1];
    } else if (argument.startsWith("--workers=")) {
      workerValue = argument.slice("--workers=".length);
    } else if (/^-j(?:=)?.+/.test(argument)) {
      workerValue = argument.replace(/^-j=?/, "");
    }

    if (isConfigOverride || isOutputOverride || (workerValue !== null && workerValue !== "1")) {
      throw new Error(
        "Der isolierte E2E-Lauf darf weder Playwright-Config noch Workerzahl überschreiben."
      );
    }
  }
}

export function runE2ETests(
  args,
  { runIsolated = runInIsolatedE2EEnvironment } = {}
) {
  assertIsolationSafeArguments(args);
  const result = runIsolated({
    command: process.execPath,
    args: [playwrightCli, "test", ...args]
  });

  return Promise.resolve(result).then((completedResult) => {
    if (completedResult.status !== null && completedResult.status !== undefined) {
      return completedResult.status;
    }
    if (completedResult.signal === "SIGINT") return 130;
    if (completedResult.signal === "SIGTERM") return 143;
    return 1;
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  process.exitCode = await runE2ETests(process.argv.slice(2));
}
