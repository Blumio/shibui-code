import { createTheme } from "./base";

const theme = createTheme(
  "github-light",
  "GitHub Light",
  {
    background: "#ffffff",
    foreground: "#24292f",
    gutterBackground: "#ffffff",
    gutterForeground: "#6e7781",
    caret: "#24292f",
    selection: "#dbe9ff",
    lineHighlight: "#f6f8fa",
    keyword: "#cf222e",
    variable: "#24292f",
    functionName: "#8250df",
    string: "#0a3069",
    number: "#0550ae",
    comment: "#6e7781",
    type: "#116329",
    operator: "#cf222e",
    punctuation: "#24292f",
  },
  false,
);

export default theme;
