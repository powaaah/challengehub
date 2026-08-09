import { defineConfig } from "@playwright/test";
import { validateE2EPaths } from "./scripts/e2e-paths.mjs";

const e2ePort = Number(process.env.CHALLENGEHUB_E2E_PORT);
let e2ePaths;
try {
  e2ePaths = validateE2EPaths();
} catch {
  throw new Error(
    "Isolierte E2E-Umgebung fehlt oder ist ungültig. Starte Playwright ausschließlich über npm run test:e2e."
  );
}

if (!Number.isInteger(e2ePort) || e2ePort < 1 || e2ePort > 65_535) {
  throw new Error("Isolierte E2E-Umgebung enthält keinen gültigen Port.");
}

const baseURL = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: e2ePaths.outputDirectory,
  workers: 1,
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${e2ePort}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      CHALLENGEHUB_DB_PATH: e2ePaths.databasePath,
      CHALLENGEHUB_E2E_RUN_DIR: e2ePaths.runDirectory,
      CHALLENGEHUB_E2E_DIST_DIR: e2ePaths.distDirectory,
      CHALLENGEHUB_E2E_TSCONFIG_PATH: e2ePaths.tsconfigPath,
      CHALLENGEHUB_E2E_OUTPUT_DIR: e2ePaths.outputDirectory
    }
  },
  use: {
    baseURL,
    permissions: ["clipboard-read", "clipboard-write"],
    headless: true
  }
});
