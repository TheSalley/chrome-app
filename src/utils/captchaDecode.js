/**
 * SVG 点阵验证码解析器
 *
 * 这类验证码用 3 列 × 5 行的小方块（h5v5h-5z）拼出数字，并给每组加轻微旋转。
 * Tesseract 面向印刷体，对点阵字识别率很差；但 SVG 路径里每个方块的坐标是精确值，
 * 旋转只是视觉变换、不改变路径数据，所以直接解析源码可以做到 100% 准确。
 *
 * 非 SVG 图片返回 null，由调用方回退到 Tesseract。
 */

// 3×5 点阵数字模板
const DIGIT_TEMPLATES = [
  ['111', '101', '101', '101', '111'], // 0
  ['010', '110', '010', '010', '111'], // 1
  ['111', '001', '111', '100', '111'], // 2
  ['111', '001', '111', '001', '111'], // 3
  ['101', '101', '111', '001', '001'], // 4
  ['111', '100', '111', '001', '111'], // 5
  ['111', '100', '111', '101', '111'], // 6
  ['111', '001', '001', '001', '001'], // 7
  ['111', '101', '111', '101', '111'], // 8
  ['111', '101', '111', '001', '111'], // 9
]

/** 解析单个 path 的 d，得到点阵网格 */
function parsePathGrid(d) {
  const cells = []
  // 匹配 M0 0h5v5h-5z / M10 15h5v5h-5z 这类方块指令
  const re = /[Mm]\s*(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)[hH]5[vV]5[hH]-?5[zZ]?/g
  let m
  while ((m = re.exec(d))) {
    cells.push({ x: parseFloat(m[1]), y: parseFloat(m[2]) })
  }
  if (!cells.length) return null

  const xs = [...new Set(cells.map((c) => c.x))].sort((a, b) => a - b)
  const ys = [...new Set(cells.map((c) => c.y))].sort((a, b) => a - b)
  const grid = ys.map((y, r) =>
    xs.map((x) => (cells.some((c) => c.x === x && c.y === y) ? '1' : '0')).join('')
  )
  return { grid, cols: xs.length, rows: ys.length }
}

/** 把任意尺寸的网格归一化到 3×5（按格子索引等比采样） */
function normalizeGrid(grid, cols, rows) {
  if (cols === 3 && rows === 5) return grid
  const out = []
  for (let r = 0; r < 5; r++) {
    let line = ''
    const sy = Math.min(rows - 1, Math.floor((r * rows) / 5))
    for (let c = 0; c < 3; c++) {
      const sx = Math.min(cols - 1, Math.floor((c * cols) / 3))
      line += grid[sy]?.[sx] === '1' ? '1' : '0'
    }
    out.push(line)
  }
  return out
}

/** 汉明距离匹配最接近的数字模板 */
function matchDigit(grid) {
  let best = 0
  let bestDist = Infinity
  DIGIT_TEMPLATES.forEach((tpl, digit) => {
    let dist = 0
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        if ((grid[r]?.[c] ?? '0') !== tpl[r][c]) dist++
      }
    }
    if (dist < bestDist) {
      bestDist = dist
      best = digit
    }
  })
  // 15 个格子里差异超过 4 个，认为不是标准点阵数字
  return bestDist <= 4 ? String(best) : '?'
}

/** SVG data URI → SVG 文本 */
function svgTextFromDataUrl(dataUrl) {
  const base64Prefix = 'data:image/svg+xml;base64,'
  if (dataUrl.startsWith(base64Prefix)) {
    try {
      return atob(dataUrl.slice(base64Prefix.length))
    } catch {
      return null
    }
  }
  if (/^data:image\/svg\+xml/.test(dataUrl)) {
    const comma = dataUrl.indexOf(',')
    if (comma < 0) return null
    try {
      return decodeURIComponent(dataUrl.slice(comma + 1))
    } catch {
      return null
    }
  }
  return null
}

/**
 * 从 SVG data URI 解码点阵验证码。
 * @returns {string|null} 识别出的数字串；非 SVG 或无法解析时返回 null
 */
export function decodeSvgCaptcha(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const svg = svgTextFromDataUrl(dataUrl)
  if (!svg) return null

  const paths = []
  const pathRe = /<path\b([^>]*)>/gi
  let m
  while ((m = pathRe.exec(svg))) {
    const attrs = m[1]
    const d = /\bd\s*=\s*"([^"]*)"/i.exec(attrs)?.[1]
    if (!d) continue
    const transform = /\btransform\s*=\s*"([^"]*)"/i.exec(attrs)?.[1] || ''
    const tx = /translate\(\s*(-?[\d.]+)/.exec(transform)
    paths.push({ d, x: tx ? parseFloat(tx[1]) : 0 })
  }
  if (!paths.length) return null

  // 按 translate 的 x 从左到右排序，就是数字顺序（旋转不影响路径坐标）
  paths.sort((a, b) => a.x - b.x)

  const digits = paths.map((p) => {
    const parsed = parsePathGrid(p.d)
    if (!parsed) return '?'
    return matchDigit(normalizeGrid(parsed.grid, parsed.cols, parsed.rows))
  })

  if (digits.some((d) => d === '?')) return null
  return digits.join('')
}
