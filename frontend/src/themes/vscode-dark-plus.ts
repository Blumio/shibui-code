import { createTheme } from "./base";

const theme = createTheme(
  "vscode-dark-plus",
  "VS Code Dark+",
  {
    background: "#1e1e1e",
    foreground: "#d4d4d4",
    gutterBackground: "#1e1e1e",
    gutterForeground: "#858585",
    caret: "#aeafad",
    selection: "#264f78",
    lineHighlight: "#2a2d2e",
    keyword: "#569cd6",
    variable: "#9cdcfe",
    functionName: "#dcdcaa",
    string: "#ce9178",
    number: "#b5cea8",
    comment: "#6a9955",
    type: "#4ec9b0",
    operator: "#d4d4d4",
    punctuation: "#d4d4d4",
  },
  true,
);

export default theme;
