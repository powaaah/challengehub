import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function samePath(left, right) {
  return path.relative(path.resolve(left), path.resolve(right)) === "";
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return Boolean(relative)
    && relative !== ".."
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative);
}

function requireRealPath(candidate, type) {
  const stats = fs.lstatSync(candidate);
  const matchesType = type === "directory" ? stats.isDirectory() : stats.isFile();

  if (stats.isSymbolicLink() || !matchesType) {
    throw new Error("E2E-Pfad ist kein erlaubtes reales Dateisystemobjekt.");
  }

  const realPath = fs.realpathSync.native(candidate);
  if (!samePath(realPath, candidate)) {
    throw new Error("E2E-Pfad wurde über einen Symlink oder eine Junction umgeleitet.");
  }

  return realPath;
}

export function validateE2EPaths(env = process.env, { requireOutput = true } = {}) {
  const runDirectory = env.CHALLENGEHUB_E2E_RUN_DIR;
  const databasePath = env.CHALLENGEHUB_DB_PATH;
  const distDirectory = env.CHALLENGEHUB_E2E_DIST_DIR;
  const tsconfigPath = env.CHALLENGEHUB_E2E_TSCONFIG_PATH;
  const outputDirectory = env.CHALLENGEHUB_E2E_OUTPUT_DIR;

  if (!runDirectory || !databasePath || !distDirectory || !tsconfigPath || !outputDirectory) {
    throw new Error("Isolierte E2E-Pfade fehlen.");
  }

  const runMatch = /^challengehub-e2e-([A-Za-z0-9]{6})$/.exec(path.basename(runDirectory));
  if (!runMatch) {
    throw new Error("Ungültige E2E-Laufkennung.");
  }

  const runId = runMatch[1];
  const realRunDirectory = requireRealPath(runDirectory, "directory");
  const realTempDirectory = fs.realpathSync.native(os.tmpdir());
  if (!isWithin(realTempDirectory, realRunDirectory)) {
    throw new Error("E2E-Laufverzeichnis liegt nicht im realen Temp-Verzeichnis.");
  }

  const expectedDatabasePath = path.join(realRunDirectory, "challengehub.sqlite");
  const expectedOutputDirectory = path.join(realRunDirectory, "test-results");
  const expectedDistDirectory = path.join(process.cwd(), `.next-e2e-${runId}`);
  const expectedTsconfigPath = path.join(process.cwd(), `.next-e2e-${runId}.tsconfig.json`);

  if (
    !samePath(databasePath, expectedDatabasePath)
    || !samePath(outputDirectory, expectedOutputDirectory)
    || !samePath(distDirectory, expectedDistDirectory)
    || !samePath(tsconfigPath, expectedTsconfigPath)
  ) {
    throw new Error("E2E-Pfade entsprechen nicht der isolierten Laufumgebung.");
  }

  const realDatabasePath = requireRealPath(databasePath, "file");
  const realOutputDirectory = requireOutput
    ? requireRealPath(outputDirectory, "directory")
    : expectedOutputDirectory;
  const realDistDirectory = requireRealPath(distDirectory, "directory");
  const realTsconfigPath = requireRealPath(tsconfigPath, "file");

  if (
    !isWithin(realRunDirectory, realDatabasePath)
    || !isWithin(realRunDirectory, realOutputDirectory)
    || !samePath(realDistDirectory, expectedDistDirectory)
    || !samePath(realTsconfigPath, expectedTsconfigPath)
  ) {
    throw new Error("E2E-Pfade wurden über einen Symlink oder eine Junction umgeleitet.");
  }

  return {
    runDirectory: realRunDirectory,
    databasePath: realDatabasePath,
    distDirectory: realDistDirectory,
    tsconfigPath: realTsconfigPath,
    outputDirectory: realOutputDirectory
  };
}
