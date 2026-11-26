import { readFileSync } from 'node:fs'
import { decodeSvgCaptcha } from '../src/utils/captchaDecode.js'

const TPL = {
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'],
  3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'],
  7: ['111', '001', '001', '001', '001'],
  8: ['111', '101', '111', '101', '111'],
  9: ['111', '101', '111', '001', '111'],
}

function makeSvg(digits) {
  let paths = ''
  let x = 5
  for (const d of digits) {
    let p = ''
    TPL[d].forEach((row, r) => {
      for (let c = 0; c < 3; c++) if (row[c] === '1') p += `M${c * 5} ${r * 5}h5v5h-5z`
    })
    paths += `<path transform="translate(${x} 7) rotate(4 7 12)" d="${p}"/>`
    x += 23
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="38"><rect width="120" height="38" fill="white"/>${paths}</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// 从 content.js 中抽出内联解码函数（无 DOM 依赖），验证与 utils 版行为一致
const source = readFileSync('src/scripts/content.js', 'utf8')
const start = source.indexOf('const CAPTCHA_TEMPLATES = [')
const end = source.indexOf('// ===== 验证码自动识别填充')
if (start < 0 || end < 0) throw new Error('无法提取内联解码函数')
const snippet = source.slice(start, end)
const decodeInline = new Function(`${snippet}\nreturn decodeSvgCaptchaInline;`)()
console.log('inline decoder extracted from content.js')

let pass = 0
const cases = ['35129', '02847', '99999', '10203', '56789']
for (const expected of cases) {
  const url = makeSvg(expected)
  const a = decodeSvgCaptcha(url)
  const b = decodeInline(url)
  const ok = a === expected && b === expected
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} expected=${expected} utils=${a} inline=${b}`)
}

// 用户提供的真实样例
const sample = readFileSync('scripts/sample-captcha.txt', 'utf8').trim()
const sampleResult = decodeInline(sample)
console.log(`\nsample result: ${sampleResult}`)
if (sampleResult === '35604') pass++
else console.log('FAIL: sample expected 35604')

console.log(`\n${pass}/${cases.length + 1} passed`)
