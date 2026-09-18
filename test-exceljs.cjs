const ExcelJS = require("exceljs");
const fs = require("fs");

(async () => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("测试");
  ws.columns = [
    { header: "序号", key: "index", width: 8 },
    { header: "图片", key: "img", width: 20 },
    { header: "URL", key: "src", width: 40 },
  ];
  ws.addRow({ index: 1, img: "", src: "https://example.com/a.png" });
  ws.addRow({ index: 2, img: "", src: "https://example.com/b.png" });

  // 用 1x1 PNG base64 测试
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const imageId = wb.addImage({ base64: png, extension: "png" });
  ws.addImage(imageId, {
    tl: { col: 1, row: 1 },
    ext: { width: 80, height: 60 },
    editAs: "oneCell",
  });
  ws.getRow(2).height = 60;

  const buf = await wb.xlsx.writeBuffer();
  fs.writeFileSync(process.env.TEMP + "\\test-img.xlsx", Buffer.from(buf));
  console.log("xlsx written:", Buffer.from(buf).length, "bytes");

  // 用 exceljs 重新读取验证图片
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.load(Buffer.from(buf));
  const ws2 = wb2.getWorksheet(1);
  console.log("images:", ws2.getImages().length);
  console.log("rows:", ws2.rowCount, "cols:", ws2.columnCount);
  console.log("A2:", JSON.stringify(ws2.getCell("A2").value));
})().catch(e => { console.error("FAIL", e); process.exit(1); });
