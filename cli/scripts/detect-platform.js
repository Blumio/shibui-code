import path from "node:path";

export function binaryNameForPlatform(platform = process.platform) {
  if (platform !== "darwin") {
    throw new Error(`Unsupported platform: ${platform}. Shibui-Code is macOS-only.`);
  }
  return "shibui-code";
}

export function platformTriplet(platform = process.platform, arch = process.arch) {
  if (platform !== "darwin") {
    throw new Error(`Unsupported platform: ${platform}. Shibui-Code is macOS-only.`);
  }
  return `${platform}-${arch}`;
}

export function resolveBinaryPath(rootDir, platform = process.platform, arch = process.arch) {
  return path.join(rootDir, "dist", "bin", platformTriplet(platform, arch), binaryNameForPlatform(platform));
}
