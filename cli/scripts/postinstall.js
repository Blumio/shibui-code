#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");

if (process.env.SHIBUI_SKIP_POSTINSTALL === "1") {
  process.exit(0);
}

if (process.platform !== "darwin") {
  console.error(`Unsupported platform: ${process.platform}. Shibui-Code is macOS-only.`);
  process.exit(1);
}

const scriptPath = path.join(rootDir, "cli", "scripts", "build-native.js");
const result = spawnSync(process.execPath, [scriptPath], {
  cwd: rootDir,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
