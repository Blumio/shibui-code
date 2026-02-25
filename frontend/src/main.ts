import "./style.css";

import { bootstrap } from "./app";

const root = document.getElementById("app");
if (root === null) {
  throw new Error("App root element was not found");
}

void bootstrap(root);
