# 网站部-小工具

Chrome 扩展，提供 WordPress 页面检查、Shopify 店铺识别、图片尺寸采集与日历 Todo 新标签页。

## 开发

- `npm run dev`：启动 Vite 开发服务器，并在 `src`、`public`、`index.html` 变更时串行构建、自动执行构建检查。
- `npm run build`：构建到 `dist`，检查 content script 是否自包含，并校验默认填充值与设置页保持一致。
- `npm run preview`：预览构建结果。

> content script 不能引用 Vite 拆分的共享 chunk，否则 Chrome 无法加载；默认填充值需同时维护在 `src/scripts/content.js` 和 `src/utils/formData.js`，构建时会校验二者一致。

## 加载扩展

1. 执行 `npm run build`。
2. 打开 `chrome://extensions` 并开启开发者模式。
3. 选择“加载已解压的扩展程序”，指向 `dist` 目录。
