const { spawn } = require("child_process");
const { writeFileSync } = require("fs");
const path = require("path");

const binGameJs = "bin/game.js";
const binGameWasm = "bin/game.wasm";

const sceneJsonPath = path.resolve("./scene.json");
let sceneJson = require(sceneJsonPath);
sceneJson.main = binGameJs;
writeFileSync(sceneJsonPath, JSON.stringify(sceneJson, null, 2));

const childProcess = spawn("dcl", ["start"], {
  stdio: [process.stdin, process.stdout, process.stderr],
});

childProcess.on("exit", () => {
  process.exit();
});

setTimeout(() => {
  sceneJson.main = binGameWasm;
  writeFileSync(sceneJsonPath, JSON.stringify(sceneJson, null, 2));
  console.log("\n\n## Now you can enter to preview and load WASM module. ##");
}, 10000);
