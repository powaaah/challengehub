import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

function findAvailablePort() {
  const script = [
    "import net from 'node:net';",
    "const server = net.createServer();",
    "server.listen(0, '127.0.0.1', () => {",
    "  const address = server.address();",
    "  server.close(() => console.log(address.port));",
    "});"
  ].join("\n");
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", script],
    { encoding: "utf8", timeout: 5_000 }
  );
  const port = Number(result.stdout.trim());

  if (result.status !== 0 || !Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("Kein freier Port für den isolierten E2E-Server verfügbar.");
  }

  return port;
}

export function createE2EEnvironment({
  portProvider = findAvailablePort,
  removeDirectory = fs.rmSync
} = {}) {
  const port = portProvider();
  const runDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "challengehub-e2e-"));
  const databasePath = path.join(runDirectory, "challengehub.sqlite");
  const runId = path.basename(runDirectory).slice("challengehub-e2e-".length);
  const distDirectory = path.join(process.cwd(), `.next-e2e-${runId}`);
  const tsconfigPath = path.join(process.cwd(), `.next-e2e-${runId}.tsconfig.json`);
  const outputDirectory = path.join(runDirectory, "test-results");
  try {
    fs.mkdirSync(distDirectory, { mode: 0o700 });
    fs.closeSync(fs.openSync(databasePath, "wx", 0o600));
    fs.mkdirSync(outputDirectory, { mode: 0o700 });
    fs.writeFileSync(
      tsconfigPath,
      `${JSON.stringify({ extends: "./tsconfig.json" }, null, 2)}\n`,
      { encoding: "utf8", flag: "wx" }
    );
  } catch (error) {
    fs.rmSync(runDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    fs.rmSync(distDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    fs.rmSync(tsconfigPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    throw error;
  }

  return {
    runDirectory,
    databasePath,
    distDirectory,
    tsconfigPath,
    outputDirectory,
    port,
    env: {
      CHALLENGEHUB_DB_PATH: databasePath,
      CHALLENGEHUB_E2E_RUN_DIR: runDirectory,
      CHALLENGEHUB_E2E_PORT: String(port),
      CHALLENGEHUB_E2E_DIST_DIR: distDirectory,
      CHALLENGEHUB_E2E_TSCONFIG_PATH: tsconfigPath,
      CHALLENGEHUB_E2E_OUTPUT_DIR: outputDirectory
    },
    cleanup() {
      let cleanupError;
      for (const directory of [runDirectory, distDirectory, tsconfigPath]) {
        try {
          removeDirectory(directory, {
            recursive: true,
            force: true,
            maxRetries: 5,
            retryDelay: 100
          });
        } catch (error) {
          cleanupError ??= error;
        }
      }

      if (cleanupError) {
        throw cleanupError;
      }
    }
  };
}

export function executeChildProcess(
  command,
  args,
  {
    cwd,
    env,
    signalTarget = process,
    stdout = process.stdout,
    stderr = process.stderr,
    spawnImpl = spawn
  }
) {
  return new Promise((resolve, reject) => {
    const child = spawnImpl(command, args, {
      cwd,
      env,
      stdio: ["inherit", "pipe", "pipe"]
    });
    let stdoutText = "";
    let stderrText = "";
    let forwardedSignal = null;
    let forceKillTimer;

    child.stdout?.on("data", (chunk) => {
      stdoutText += chunk.toString();
      stdout.write(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderrText += chunk.toString();
      stderr.write(chunk);
    });

    const forwardSignal = (signal) => {
      forwardedSignal ??= signal;
      if (!child.killed) {
        child.kill(signal);
        forceKillTimer = setTimeout(() => child.kill("SIGKILL"), 5_000);
        forceKillTimer.unref?.();
      }
    };
    const onSigint = () => forwardSignal("SIGINT");
    const onSigterm = () => forwardSignal("SIGTERM");
    const removeSignalHandlers = () => {
      signalTarget.off("SIGINT", onSigint);
      signalTarget.off("SIGTERM", onSigterm);
      if (forceKillTimer) clearTimeout(forceKillTimer);
    };

    signalTarget.on("SIGINT", onSigint);
    signalTarget.on("SIGTERM", onSigterm);
    child.once("error", (error) => {
      removeSignalHandlers();
      reject(error);
    });
    child.once("close", (status, signal) => {
      removeSignalHandlers();
      resolve({
        status,
        signal: forwardedSignal ?? signal,
        stdout: stdoutText,
        stderr: stderrText
      });
    });
  });
}

export async function runInIsolatedE2EEnvironment({
  command,
  args = [],
  spawnSyncImpl,
  executeProcess,
  signalTarget = process,
  createEnvironment = createE2EEnvironment,
  reportCleanupError = (error) => console.error("E2E-Cleanup fehlgeschlagen:", error),
  writeOutput = (result) => {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  },
  maxPortAttempts = 3
}) {
  const processExecutor = executeProcess ?? (spawnSyncImpl
    ? async (executorCommand, executorArgs, options) => {
      const result = spawnSyncImpl(executorCommand, executorArgs, {
        ...options,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
        stdio: ["inherit", "pipe", "pipe"]
      });
      writeOutput(result);
      return result;
    }
    : executeChildProcess);

  for (let attempt = 1; attempt <= maxPortAttempts; attempt += 1) {
    const environment = createEnvironment();
    let result;
    let executionError;

    try {
      result = await processExecutor(command, args, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ...environment.env
        },
        signalTarget
      });
    } catch (error) {
      executionError = error;
      throw error;
    } finally {
      try {
        environment.cleanup();
      } catch (cleanupError) {
        if (executionError || result?.status !== 0) {
          reportCleanupError(cleanupError);
        } else {
          throw cleanupError;
        }
      }
    }

    const processOutput = `${result?.stdout ?? ""}\n${result?.stderr ?? ""}`;
    const hasPortCollision = result?.status !== 0
      && /EADDRINUSE|address already in use|already.*used|port.*used/i.test(processOutput);

    if (!hasPortCollision || attempt === maxPortAttempts) {
      return result;
    }
  }

  throw new Error("E2E-Lauf konnte nicht gestartet werden.");
}
