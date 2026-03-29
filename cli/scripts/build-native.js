#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { binaryNameForPlatform, platformTriplet, resolveBinaryPath } from "./detect-platform.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
if (process.platform !== "darwin") {
  console.error(`Unsupported platform: ${process.platform}. Shibui-Code is macOS-only.`);
  process.exit(1);
}
const triplet = platformTriplet();
const buildDir = path.join(rootDir, ".native-build", triplet);
const binaryPath = resolveBinaryPath(rootDir);
const withTests = process.argv.includes("--with-tests");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function locateBuiltBinary() {
  const binaryName = binaryNameForPlatform();
  const candidates = [
    path.join(buildDir, binaryName),
    path.join(buildDir, "Release", binaryName),
    path.join(buildDir, "RelWithDebInfo", binaryName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function ensureFrontendBundle() {
  const frontendBundle = path.join(rootDir, "src", "frontend_bundle.hpp");
  const frontendProject = path.join(rootDir, "frontend", "package.json");
  const frontendModules = path.join(rootDir, "frontend", "node_modules");
  const skipBuild = process.env.SHIBUI_SKIP_FRONTEND_BUILD === "1";
  const forceBuild = process.env.SHIBUI_FORCE_FRONTEND_BUILD === "1";

  if (skipBuild) {
    if (!fs.existsSync(frontendBundle)) {
      console.error("SHIBUI_SKIP_FRONTEND_BUILD is set, but src/frontend_bundle.hpp is missing.");
      process.exit(1);
    }
    return;
  }

  if (fs.existsSync(frontendBundle) && !forceBuild) {
    return;
  }

  if (!fs.existsSync(frontendProject)) {
    console.error("frontend/package.json is missing and src/frontend_bundle.hpp is unavailable.");
    process.exit(1);
  }

  if (!fs.existsSync(frontendModules)) {
    run("npm", ["--prefix", "frontend", "install"]);
  }

  run("npm", ["run", "build:frontend"]);
}

function buildNativeBinary() {
  fs.mkdirSync(buildDir, { recursive: true });

  run("cmake", [
    "-S",
    rootDir,
    "-B",
    buildDir,
    "-DSHIBUI_BUILD_TESTS=" + (withTests ? "ON" : "OFF"),
    "-DCMAKE_BUILD_TYPE=Release",
  ]);

  run("cmake", ["--build", buildDir, "--config", "Release"]);

  const builtBinary = locateBuiltBinary();
  if (builtBinary === null) {
    console.error("Native binary was not found after build.");
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(binaryPath), { recursive: true });
  fs.copyFileSync(builtBinary, binaryPath);
  fs.chmodSync(binaryPath, 0o755);

  console.log(`Built ${binaryPath}`);
}

ensureFrontendBundle();
buildNativeBinary();
