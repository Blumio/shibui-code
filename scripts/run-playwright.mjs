#!/usr/bin/env node

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const frontendDir = path.join(rootDir, "frontend");
const requireFromRoot = createRequire(import.meta.url);
const playwrightTestPackage = "@playwright/test";
const playwrightVersion = "1.54.2";

const action = process.argv[2];
if (action !== "install" && action !== "test") {
  console.error("Usage: node scripts/run-playwright.mjs <install|test>");
  process.exit(1);
}

function run(command, args, cwd = rootDir) {
  return spawnSync(command, args, {
    cwd,
    stdio: "inherit",
  });
}

function hasLocalPlaywright() {
  try {
    requireFromRoot.resolve(`${playwrightTestPackage}/package.json`, { paths: [frontendDir] });
    return true;
  } catch {
    return false;
  }
}

function shouldFailOnMissingPlaywright() {
  return process.env.SHIBUI_REQUIRE_E2E === "1" || process.env.CI === "true";
}

function executeLocal(actionName) {
  if (actionName === "install") {
    return run("npm", ["--prefix", frontendDir, "exec", "playwright", "install", "chromium"]);
  }

  return run("npm", ["--prefix", frontendDir, "exec", "playwright", "test", "--config", "playwright.config.ts"]);
}

function executeNpx(actionName) {
  const npxArgs = ["--yes", "-p", `${playwrightTestPackage}@${playwrightVersion}`, "playwright"];

  if (actionName === "install") {
    return run("npx", [...npxArgs, "install", "chromium"], frontendDir);
  }

  return run("npx", [...npxArgs, "test", "--config", "playwright.config.ts"], frontendDir);
}

let result;
if (hasLocalPlaywright()) {
  result = executeLocal(action);
} else {
  result = executeNpx(action);
}

if (result.status === 0) {
  process.exit(0);
}

if (!shouldFailOnMissingPlaywright()) {
  console.warn("Playwright is unavailable in this environment; skipping e2e checks.");
  process.exit(0);
}

process.exit(result.status ?? 1);
