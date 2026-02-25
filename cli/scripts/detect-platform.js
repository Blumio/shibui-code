import path from "node:path";

export function binaryNameForPlatform(platform = process.platform) {
  return platform === "win32" ? "shibui-code.exe" : "shibui-code";
}

export function platformTriplet(platform = process.platform, arch = process.arch) {
  return `${platform}-${arch}`;
}

export function resolveBinaryPath(rootDir, platform = process.platform, arch = process.arch) {
  return path.join(rootDir, "dist", "bin", platformTriplet(platform, arch), binaryNameForPlatform(platform));
}
