import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  createE2EEnvironment,
  runInIsolatedE2EEnvironment
} from "../scripts/e2e-environment.mjs";
import { runE2ETests } from "../scripts/run-e2e.mjs";

test("E2E-Umgebung verwendet eine entfernbare Datenbank außerhalb der normalen Projektdaten", () => {
  const environment = createE2EEnvironment();

  try {
    const projectDatabase = path.resolve(".data", "challengehub.sqlite");

    assert.notEqual(environment.databasePath, projectDatabase);
    assert.equal(path.basename(environment.databasePath), "challengehub.sqlite");
    assert.ok(environment.runDirectory.startsWith(path.join(os.tmpdir(), "challengehub-e2e-")));
    assert.equal(environment.env.CHALLENGEHUB_DB_PATH, environment.databasePath);
    assert.equal(environment.env.CHALLENGEHUB_E2E_RUN_DIR, environment.runDirectory);
    assert.equal(Number(environment.env.CHALLENGEHUB_E2E_PORT), environment.port);
    assert.equal(
      environment.env.CHALLENGEHUB_E2E_DIST_DIR,
      environment.distDirectory
    );
    assert.equal(path.dirname(environment.distDirectory), process.cwd());
    assert.match(path.basename(environment.distDirectory), /^\.next-e2e-/);
    assert.equal(environment.env.CHALLENGEHUB_E2E_TSCONFIG_PATH, environment.tsconfigPath);
    assert.equal(environment.env.CHALLENGEHUB_E2E_OUTPUT_DIR, environment.outputDirectory);
    assert.equal(JSON.parse(fs.readFileSync(environment.tsconfigPath, "utf8")).extends, "./tsconfig.json");
    assert.equal(fs.lstatSync(environment.runDirectory).isSymbolicLink(), false);
    assert.equal(fs.lstatSync(environment.distDirectory).isSymbolicLink(), false);
    assert.equal(fs.lstatSync(environment.databasePath).isFile(), true);
    assert.equal(fs.lstatSync(environment.outputDirectory).isDirectory(), true);
    assert.ok(environment.port >= 1 && environment.port <= 65_535);

    fs.writeFileSync(environment.databasePath, "isolated-e2e-data");
    assert.equal(fs.existsSync(environment.databasePath), true);
  } finally {
    environment.cleanup();
  }

  assert.equal(fs.existsSync(environment.runDirectory), false);
  assert.equal(fs.existsSync(environment.distDirectory), false);
  assert.equal(fs.existsSync(environment.tsconfigPath), false);
});

test("E2E-Runner räumt die Datenbank auch nach einem fehlgeschlagenen Testprozess auf", async () => {
  let runDirectory = "";

  const result = await runInIsolatedE2EEnvironment({
    command: process.execPath,
    args: ["fake-playwright"],
    spawnSyncImpl(_command, _args, options) {
      const databasePath = options.env.CHALLENGEHUB_DB_PATH;
      runDirectory = path.dirname(databasePath);
      fs.writeFileSync(databasePath, "failed-e2e-data");
      return { status: 7 };
    }
  });

  assert.equal(result.status, 7);
  assert.equal(fs.existsSync(runDirectory), false);
});

test("E2E-Cleanup wiederholt kurzzeitig blockierte Windows-Löschvorgänge", () => {
  let cleanupOptions;
  const environment = createE2EEnvironment({
    portProvider: () => 43_123,
    removeDirectory(directory, options) {
      cleanupOptions = options;
      fs.rmSync(directory, options);
    }
  });

  environment.cleanup();

  assert.deepEqual(cleanupOptions, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100
  });
  assert.equal(fs.existsSync(environment.runDirectory), false);
});

test("E2E-Runner bewahrt den Teststatus, wenn zusätzlich das Cleanup scheitert", async () => {
  const cleanupError = new Error("locked");
  let reportedError;
  const result = await runInIsolatedE2EEnvironment({
    command: process.execPath,
    createEnvironment() {
      return {
        env: {},
        cleanup() {
          throw cleanupError;
        }
      };
    },
    spawnSyncImpl() {
      return { status: 7 };
    },
    reportCleanupError(error) {
      reportedError = error;
    }
  });

  assert.equal(result.status, 7);
  assert.equal(reportedError, cleanupError);
});

test("E2E-Runner wiederholt den vollständigen Lauf nach einer Portkollision", async () => {
  let environmentsCreated = 0;
  let environmentsCleaned = 0;
  let processStarts = 0;

  const result = await runInIsolatedE2EEnvironment({
    command: process.execPath,
    createEnvironment() {
      environmentsCreated += 1;
      return {
        env: { CHALLENGEHUB_E2E_PORT: String(43_000 + environmentsCreated) },
        cleanup() {
          environmentsCleaned += 1;
        }
      };
    },
    spawnSyncImpl() {
      processStarts += 1;
      return processStarts === 1
        ? { status: 1, stderr: "listen EADDRINUSE: address already in use" }
        : { status: 0, stderr: "" };
    },
    writeOutput() {}
  });

  assert.equal(result.status, 0);
  assert.equal(processStarts, 2);
  assert.equal(environmentsCreated, 2);
  assert.equal(environmentsCleaned, 2);
});

test("E2E-Runner wartet auf einen signalbeendeten Prozess und räumt danach auf", async () => {
  const signalTarget = new EventEmitter();
  let cleanupCalls = 0;
  let forwardedSignal;

  const execution = runInIsolatedE2EEnvironment({
    command: process.execPath,
    spawnSyncImpl: () => ({ status: 0 }),
    createEnvironment: () => ({
      env: {},
      cleanup() {
        cleanupCalls += 1;
      }
    }),
    signalTarget,
    executeProcess(_command, _args, options) {
      return new Promise((resolve) => {
        options.signalTarget.once("SIGTERM", () => {
          forwardedSignal = "SIGTERM";
          resolve({ status: null, signal: "SIGTERM", stdout: "", stderr: "" });
        });
      });
    }
  });

  assert.equal(typeof execution.then, "function");
  signalTarget.emit("SIGTERM");
  const result = await execution;

  assert.equal(result.signal, "SIGTERM");
  assert.equal(forwardedSignal, "SIGTERM");
  assert.equal(cleanupCalls, 1);
});

test("Playwright verweigert einen Lauf ohne explizite isolierte Datenbank", () => {
  const env = { ...process.env };
  delete env.CHALLENGEHUB_DB_PATH;

  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", "await import('./playwright.config.ts')"],
    {
      cwd: process.cwd(),
      env,
      encoding: "utf8"
    }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Isolierte E2E-Umgebung/);
});

test("Playwright verweigert die normale Projektdatenbank auch bei gesetzten Variablen", () => {
  const projectDataDirectory = path.join(process.cwd(), ".data");
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", "await import('./playwright.config.ts')"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        CHALLENGEHUB_DB_PATH: path.join(projectDataDirectory, "challengehub.sqlite"),
        CHALLENGEHUB_E2E_RUN_DIR: projectDataDirectory,
        CHALLENGEHUB_E2E_PORT: "43123"
      },
      encoding: "utf8"
    }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Isolierte E2E-Umgebung/);
});

test("Playwright und Next.js verweigern ein Junction-Runverzeichnis außerhalb des Temp-Verzeichnisses", () => {
  const junctionPath = path.join(os.tmpdir(), "challengehub-e2e-ABC123");
  const runId = "ABC123";
  const distDirectory = path.join(process.cwd(), `.next-e2e-${runId}`);
  const tsconfigPath = path.join(process.cwd(), `.next-e2e-${runId}.tsconfig.json`);

  if (fs.existsSync(junctionPath)) {
    fs.unlinkSync(junctionPath);
  }
  fs.symlinkSync(path.join(process.cwd(), ".data"), junctionPath, "junction");

  try {
    const env = {
      ...process.env,
      CHALLENGEHUB_DB_PATH: path.join(junctionPath, "challengehub.sqlite"),
      CHALLENGEHUB_E2E_RUN_DIR: junctionPath,
      CHALLENGEHUB_E2E_PORT: "43123",
      CHALLENGEHUB_E2E_DIST_DIR: distDirectory,
      CHALLENGEHUB_E2E_TSCONFIG_PATH: tsconfigPath,
      CHALLENGEHUB_E2E_OUTPUT_DIR: path.join(junctionPath, "test-results")
    };

    for (const configPath of ["./playwright.config.ts", "./next.config.ts"]) {
      const result = spawnSync(
        process.execPath,
        ["--input-type=module", "--eval", `await import('${configPath}')`],
        { cwd: process.cwd(), env, encoding: "utf8" }
      );

      assert.notEqual(result.status, 0, `${configPath} akzeptiert die Junction.`);
      assert.match(result.stderr, /isoliert|ungültig/i);
    }
  } finally {
    fs.unlinkSync(junctionPath);
  }
});

test("Playwright startet ausschließlich einen eigenen Server mit der isolierten Datenbank", () => {
  const environment = createE2EEnvironment({ portProvider: () => 43_123 });
  const script = [
    "const { default: config } = await import('./playwright.config.ts');",
    "console.log(JSON.stringify({",
    "  databasePath: config.webServer.env.CHALLENGEHUB_DB_PATH,",
    "  distDirectory: config.webServer.env.CHALLENGEHUB_E2E_DIST_DIR,",
    "  tsconfigPath: config.webServer.env.CHALLENGEHUB_E2E_TSCONFIG_PATH,",
    "  outputDirectory: config.outputDir,",
    "  reuseExistingServer: config.webServer.reuseExistingServer,",
    "  workers: config.workers,",
    "  command: config.webServer.command,",
    "  serverUrl: config.webServer.url,",
    "  baseURL: config.use.baseURL,",
    "  channel: config.use.channel",
    "}));"
  ].join("\n");

  let result;
  try {
    result = spawnSync(process.execPath, ["--input-type=module", "--eval", script], {
      cwd: process.cwd(),
      env: { ...process.env, ...environment.env },
      encoding: "utf8"
    });
  } finally {
    environment.cleanup();
  }

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout.trim()), {
    databasePath: environment.databasePath,
    distDirectory: environment.distDirectory,
    tsconfigPath: environment.tsconfigPath,
    outputDirectory: environment.outputDirectory,
    reuseExistingServer: false,
    workers: 1,
    command: "npm run dev -- --hostname 127.0.0.1 --port 43123",
    serverUrl: "http://127.0.0.1:43123",
    baseURL: "http://127.0.0.1:43123"
  });
});

test("Next.js verwendet pro E2E-Lauf ein eigenes Build-Verzeichnis", () => {
  const environment = createE2EEnvironment({ portProvider: () => 43_123 });
  let result;
  try {
    result = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        "const { default: config } = await import('./next.config.ts'); console.log(JSON.stringify({ distDir: config.distDir, tsconfigPath: config.typescript?.tsconfigPath }));"
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, ...environment.env },
        encoding: "utf8"
      }
    );
  } finally {
    environment.cleanup();
  }

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout.trim()), {
    distDir: path.basename(environment.distDirectory),
    tsconfigPath: path.basename(environment.tsconfigPath)
  });
});

test("E2E-Runner reicht die ausgewählten Tests an die Playwright-CLI weiter", async () => {
  let invocation;

  const status = await runE2ETests(["tests/e2e/profile.spec.ts", "--workers=1"], {
    runIsolated(options) {
      invocation = options;
      return { status: 5 };
    }
  });

  assert.equal(status, 5);
  assert.equal(invocation.command, process.execPath);
  assert.equal(path.basename(invocation.args[0]), "cli.js");
  assert.match(invocation.args[0], /@playwright[\\/]test/);
  assert.deepEqual(invocation.args.slice(1), [
    "test",
    "tests/e2e/profile.spec.ts",
    "--workers=1"
  ]);
});

test("E2E-Runner erhält den üblichen Exitcode eines Abbruchsignals", async () => {
  const status = await runE2ETests([], {
    runIsolated: () => ({ status: null, signal: "SIGTERM" })
  });

  assert.equal(status, 143);
});

test("E2E-Runner verweigert Overrides von Config und Workerzahl", () => {
  const forbiddenArguments = [
    ["--config", "unsafe.config.ts"],
    ["--config=unsafe.config.ts"],
    ["-c", "unsafe.config.ts"],
    ["-cunsafe.config.ts"],
    ["--workers", "2"],
    ["--workers=2"],
    ["-j", "2"],
    ["-j2"],
    ["--output", "unsafe-results"],
    ["--output=unsafe-results"]
  ];

  for (const args of forbiddenArguments) {
    assert.throws(
      () => runE2ETests(args, { runIsolated: () => ({ status: 0 }) }),
      /darf weder Playwright-Config noch Workerzahl überschreiben/
    );
  }
});
