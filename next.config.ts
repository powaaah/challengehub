import type { NextConfig } from "next";
import * as path from "node:path";
import { buildSecurityHeaders } from "./lib/security-headers.mjs";
import { validateE2EPaths } from "./scripts/e2e-paths.mjs";

const e2eRunDirectory = process.env.CHALLENGEHUB_E2E_RUN_DIR;
let e2ePaths;

if (e2eRunDirectory) {
  try {
    e2ePaths = validateE2EPaths(process.env, { requireOutput: false });
  } catch {
    throw new Error("Ungültiges isoliertes Next.js-E2E-Verzeichnis.");
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "128kb"
    }
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: buildSecurityHeaders(process.env.NODE_ENV === "production")
    }];
  },
  ...(e2ePaths ? { distDir: path.basename(e2ePaths.distDirectory) } : {}),
  ...(e2ePaths
    ? { typescript: { tsconfigPath: path.basename(e2ePaths.tsconfigPath) } }
    : {})
};

export default nextConfig;
