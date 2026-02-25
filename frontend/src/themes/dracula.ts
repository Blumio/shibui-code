import { createTheme } from "./base";

const theme = createTheme(
  "dracula",
  "Dracula",
  {
    background: "#282a36",
    foreground: "#f8f8f2",
    gutterBackground: "#282a36",
    gutterForeground: "#6272a4",
    caret: "#f8f8f0",
    selection: "#44475a",
    lineHighlight: "#343746",
    keyword: "#ff79c6",
    variable: "#f8f8f2",
    functionName: "#50fa7b",
    string: "#f1fa8c",
    number: "#bd93f9",
    comment: "#6272a4",
    type: "#8be9fd",
    operator: "#ff79c6",
    punctuation: "#f8f8f2",
  },
  true,
);

export default theme;
