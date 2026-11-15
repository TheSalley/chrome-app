import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const file = "dist/assets/content.js";
const source = readFileSync(file, "utf8");

if (/^\s*import\s/m.test(source)) {
  console.error(`${file} 不是自包含文件：检测到 import 语句，Chrome content script 将无法加载。`);
  process.exit(1);
}

const contentSource = readFileSync("src/scripts/content.js", "utf8");
const defaultMatch = contentSource.match(/const DEFAULT_FORM_DATA = (\{[\s\S]*?\});/);
if (!defaultMatch) {
  console.error("未在 src/scripts/content.js 中找到 DEFAULT_FORM_DATA。");
  process.exit(1);
}

let inlineDefaults;
try {
  inlineDefaults = Function(`"use strict"; return (${defaultMatch[1]});`)();
} catch (error) {
  console.error("无法解析 src/scripts/content.js 中的 DEFAULT_FORM_DATA。", error);
  process.exit(1);
}

const { DEFAULT_FORM_DATA } = await import(
  pathToFileURL(resolve("src/utils/formData.js")).href
);
const keys = new Set([...Object.keys(inlineDefaults), ...Object.keys(DEFAULT_FORM_DATA)]);
const mismatched = [...keys].filter((key) => inlineDefaults[key] !== DEFAULT_FORM_DATA[key]);
if (mismatched.length) {
  console.error(
    `content script 与设置页的默认填充值不一致：${mismatched.join(", ")}。` +
      "请同步 src/scripts/content.js 和 src/utils/formData.js。"
  );
  process.exit(1);
}

console.log("content.js self-contained and default form data checks passed");
