import type { ListItem, ThemeLoader } from "./types";

const THEME_LOADERS: ThemeLoader[] = [
  {
    id: "vscode-dark-plus",
    displayName: "VS Code Dark+",
    load: async () => (await import("./themes/vscode-dark-plus")).default,
  },
  {
    id: "monokai",
    displayName: "Monokai",
    load: async () => (await import("./themes/monokai")).default,
  },
  {
    id: "dracula",
    displayName: "Dracula",
    load: async () => (await import("./themes/dracula")).default,
  },
  {
    id: "solarized-dark",
    displayName: "Solarized Dark",
    load: async () => (await import("./themes/solarized-dark")).default,
  },
  {
    id: "solarized-light",
    displayName: "Solarized Light",
    load: async () => (await import("./themes/solarized-light")).default,
  },
  {
    id: "github-light",
    displayName: "GitHub Light",
    load: async () => (await import("./themes/github-light")).default,
  },
];

export function themeLoaders(): ThemeLoader[] {
  return [...THEME_LOADERS];
}

export function themeListItems(): ListItem[] {
  return THEME_LOADERS.map((theme) => ({
    id: theme.id,
    label: theme.displayName,
    searchText: `${theme.displayName} ${theme.id}`,
  }));
}

export function findThemeLoader(themeId: string): ThemeLoader | undefined {
  return THEME_LOADERS.find((entry) => entry.id === themeId);
}
