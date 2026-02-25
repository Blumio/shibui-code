#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "frontend", "dist");
const indexPath = path.join(distDir, "index.html");
const outputPath = path.join(rootDir, "src", "frontend_bundle.hpp");

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function extractAssetPath(html, pattern, description) {
  const match = html.match(pattern);
  if (match === null || match[1] === undefined) {
    throw new Error(`Unable to find ${description} in frontend/dist/index.html`);
  }
  return match[1];
}

function toSafeJsLiteral(source) {
  return JSON.stringify(source)
    .replace(/</g, "\\u003C")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function buildInlineHtml(indexHtml, cssContent, jsContent) {
  const withoutExternalCss = indexHtml.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/g, "");
  const withoutExternalJs = withoutExternalCss.replace(/<script[^>]*type=["']module["'][^>]*src=["'][^"']+["'][^>]*><\/script>/g, "");
  const safeCss = toSafeJsLiteral(cssContent);
  const jsDataUrl = `data:text/javascript;base64,${Buffer.from(jsContent, "utf8").toString("base64")}`;
  const safeJsDataUrl = toSafeJsLiteral(jsDataUrl);
  const bootstrapScript = [
    "<script type=\"module\">",
    "(function(){",
    `const css=${safeCss};`,
    "const style=document.createElement(\"style\");",
    "style.textContent=css;",
    "document.head.appendChild(style);",
    "const script=document.createElement(\"script\");",
    "script.type=\"module\";",
    `script.src=${safeJsDataUrl};`,
    "document.body.appendChild(script);",
    "})();",
    "</script>",
  ].join("");

  return withoutExternalJs.replace("</body>", `${bootstrapScript}</body>`);
}

function toHeader(html) {
  const safeHtml = html.replace(/\)SHIBUI_HTML\"/g, ")SHIBUI_ESCAPED_HTML\"");
  return `#ifndef SHIBUI_CODE_FRONTEND_BUNDLE_HPP\n#define SHIBUI_CODE_FRONTEND_BUNDLE_HPP\n\nconstexpr const char* kFrontendBundleHtml = R\"SHIBUI_HTML(${safeHtml})SHIBUI_HTML\";\n\n#endif\n`;
}

const indexHtml = readFile(indexPath);
const cssAssetPath = extractAssetPath(indexHtml, /<link[^>]*href=["']([^"']+\.css)["'][^>]*>/, "built CSS");
const jsAssetPath = extractAssetPath(indexHtml, /<script[^>]*src=["']([^"']+\.js)["'][^>]*><\/script>/, "built JavaScript");

const cssContent = readFile(path.join(distDir, cssAssetPath.replace(/^\//, "")));
const jsContent = readFile(path.join(distDir, jsAssetPath.replace(/^\//, "")));

const inlineHtml = buildInlineHtml(indexHtml, cssContent, jsContent);
const header = toHeader(inlineHtml);
fs.writeFileSync(outputPath, header, "utf8");

console.log(`Generated ${outputPath}`);
