# 网站部-小工具

Chrome 扩展，提供 WordPress 页面检查、Shopify 店铺识别、图片尺寸采集与日历 Todo 新标签页。

## 开发

- `npm run dev`：启动 Vite 开发服务器，并在 `src` 变更时自动构建。
- `npm run build`：构建到 `dist`。
- `npm run preview`：预览构建结果。

## 加载扩展

1. 执行 `npm run build`。
2. 打开 `chrome://extensions` 并开启开发者模式。
3. 选择“加载已解压的扩展程序”，指向 `dist` 目录。
