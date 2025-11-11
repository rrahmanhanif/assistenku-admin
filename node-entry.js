// node-entry.js
import parseAst from "./parseAst.js";

export function startBuild() {
  console.log("Node entry initialized with parseAst:", parseAst());
}

startBuild();
