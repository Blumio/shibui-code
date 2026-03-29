#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { resolveBinaryPath } from "./scripts/detect-platform.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
if (process.platform !== "darwin") {
  console.error(`Unsupported platform: ${process.platform}. Shibui-Code is macOS-only.`);
  process.exit(1);
}
const binaryPath = resolveBinaryPath(rootDir, "darwin", process.arch);

function runBuildIfNeeded() {
  if (fs.existsSync(binaryPath)) {
    return;
  }

  const buildScript = path.join(rootDir, "cli", "scripts", "build-native.js");
  const build = spawnSync(process.execPath, [buildScript], {
    cwd: rootDir,
    stdio: "inherit",
  });

  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

function launchBinary() {
  const run = spawnSync(binaryPath, process.argv.slice(2), {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  process.exit(run.status ?? 0);
}

runBuildIfNeeded();
launchBinary();
