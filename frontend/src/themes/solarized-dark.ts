import { createTheme } from "./base";

const theme = createTheme(
  "solarized-dark",
  "Solarized Dark",
  {
    background: "#002b36",
    foreground: "#93a1a1",
    gutterBackground: "#002b36",
    gutterForeground: "#586e75",
    caret: "#93a1a1",
    selection: "#073642",
    lineHighlight: "#073642",
    keyword: "#859900",
    variable: "#93a1a1",
    functionName: "#268bd2",
    string: "#2aa198",
    number: "#d33682",
    comment: "#586e75",
    type: "#b58900",
    operator: "#6c71c4",
    punctuation: "#93a1a1",
  },
  true,
);

export default theme;
