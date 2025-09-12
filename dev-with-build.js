import { spawn } from "child_process";
import chokidar from "chokidar";

const devServer = spawn("vite", ["--port", "3000"], {
  stdio: "inherit",
  shell: true,
});

console.log("Vite development server started at http://localhost:3000");

const watcher = chokidar.watch("src", {
  persistent: true,
  ignoreInitial: true,
});

watcher.on("ready", () => {
  console.log("Watcher is ready, monitoring src directory...");
});

watcher.on("change", (filePath) => {
  console.log(`File changed: ${filePath}`);
  console.log("Triggering build...");

  const build = spawn("vite", ["build"], {
    stdio: "inherit",
    shell: true,
  });

  build.on("close", (code) => {
    console.log(`Build completed with code ${code}`);
  });
});

process.on("SIGINT", () => {
  devServer.kill();
  process.exit();
});
