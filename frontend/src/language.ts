import type { Extension } from "@codemirror/state";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { StreamLanguage } from "@codemirror/language";
import { shell as legacyShell } from "@codemirror/legacy-modes/mode/shell";

import type { LanguageId } from "./types";

export interface LanguageOption {
  id: LanguageId;
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "cpp", label: "C++" },
  { id: "c", label: "C" },
  { id: "rust", label: "Rust" },
  { id: "java", label: "Java" },
  { id: "go", label: "Go" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "bash", label: "Bash" },
  { id: "markdown", label: "Markdown" },
];

const EXTENSIONS: Record<LanguageId, Extension> = {
  python: python(),
  javascript: javascript({ jsx: true }),
  typescript: javascript({ typescript: true }),
  cpp: cpp(),
  c: cpp({ dialect: "c" }),
  rust: rust(),
  java: java(),
  go: go(),
  html: html(),
  css: css(),
  json: json(),
  bash: StreamLanguage.define(legacyShell),
  markdown: markdown(),
};

export function defaultLanguage(): LanguageId {
  return "python";
}

export function languageOptions(): LanguageOption[] {
  return [...LANGUAGES];
}

export function languageLabel(languageId: LanguageId): string {
  const language = LANGUAGES.find((entry) => entry.id === languageId);
  return language === undefined ? languageId : language.label;
}

export function languageExtension(languageId: LanguageId): Extension {
  return EXTENSIONS[languageId];
}
