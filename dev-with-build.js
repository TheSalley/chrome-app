import { spawn } from "child_process";
import chokidar from "chokidar";

const devServer = spawn("vite", ["--port", "3000"], {
  stdio: "inherit",
  shell: true,
});

console.log("Vite development server started at http://localhost:3000");

let buildProcess = null;
let buildQueued = false;
let buildTimer = null;

function runBuildCheck() {
  return new Promise((resolve) => {
    const check = spawn(process.execPath, ["scripts/check-content-entry.mjs"], {
      stdio: "inherit",
    });
    check.on("close", (code) => {
      if (code !== 0) {
        console.error("Build check failed.");
      }
      resolve(code === 0);
    });
  });
}

function startBuild() {
  if (buildProcess) {
    buildQueued = true;
    return;
  }

  console.log("Triggering build...");
  buildProcess = spawn("vite", ["build"], {
    stdio: "inherit",
    shell: true,
  });

  buildProcess.on("close", async (code) => {
    console.log(`Build completed with code ${code}`);
    if (code === 0) await runBuildCheck();
    buildProcess = null;
    if (buildQueued) {
      buildQueued = false;
      startBuild();
    }
  });
}

function scheduleBuild(filePath) {
  console.log(`File changed: ${filePath}`);
  clearTimeout(buildTimer);
  buildTimer = setTimeout(startBuild, 200);
}

const watcher = chokidar.watch(["src", "public", "index.html"], {
  persistent: true,
  ignoreInitial: true,
});

watcher.on("ready", () => {
  console.log("Watcher is ready, monitoring src, public and index.html...");
});

watcher.on("change", scheduleBuild);
watcher.on("add", scheduleBuild);
watcher.on("unlink", scheduleBuild);

process.on("SIGINT", () => {
  clearTimeout(buildTimer);
  if (buildProcess) buildProcess.kill();
  devServer.kill();
  process.exit();
});
