import { createTheme } from "./base";

const theme = createTheme(
  "solarized-light",
  "Solarized Light",
  {
    background: "#fdf6e3",
    foreground: "#657b83",
    gutterBackground: "#fdf6e3",
    gutterForeground: "#93a1a1",
    caret: "#657b83",
    selection: "#eee8d5",
    lineHighlight: "#eee8d5",
    keyword: "#859900",
    variable: "#586e75",
    functionName: "#268bd2",
    string: "#2aa198",
    number: "#d33682",
    comment: "#93a1a1",
    type: "#b58900",
    operator: "#6c71c4",
    punctuation: "#657b83",
  },
  false,
);

export default theme;
