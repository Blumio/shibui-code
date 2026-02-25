import type { Extension } from "@codemirror/state";

export type LanguageId =
  | "python"
  | "javascript"
  | "typescript"
  | "cpp"
  | "c"
  | "rust"
  | "java"
  | "go"
  | "html"
  | "css"
  | "json"
  | "bash"
  | "markdown";

export interface TabModel {
  id: number;
  title: string;
  language: LanguageId;
  content: string;
}

export interface ThemeSpec {
  id: string;
  displayName: string;
  extension: Extension;
  editorClassName: string;
}

export interface ThemeLoader {
  id: string;
  displayName: string;
  load: () => Promise<ThemeSpec>;
}

export interface ListItem {
  id: string;
  label: string;
  searchText: string;
}

export interface SnapshotTab {
  title: string;
  language: LanguageId;
  content: string;
}
