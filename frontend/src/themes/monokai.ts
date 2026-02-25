import { createTheme } from "./base";

const theme = createTheme(
  "monokai",
  "Monokai",
  {
    background: "#272822",
    foreground: "#f8f8f2",
    gutterBackground: "#272822",
    gutterForeground: "#75715e",
    caret: "#f8f8f0",
    selection: "#49483e",
    lineHighlight: "#3e3d32",
    keyword: "#f92672",
    variable: "#f8f8f2",
    functionName: "#a6e22e",
    string: "#e6db74",
    number: "#ae81ff",
    comment: "#75715e",
    type: "#66d9ef",
    operator: "#f92672",
    punctuation: "#f8f8f2",
  },
  true,
);

export default theme;
