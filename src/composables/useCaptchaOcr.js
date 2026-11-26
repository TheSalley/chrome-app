import { ref } from 'vue'
import { createWorker } from 'tesseract.js'
import { decodeSvgCaptcha } from '@/utils/captchaDecode.js'

// 语言包与 core 已本地化到 public/tessdata，扩展内无需访问外网 CDN
const OCR_BASE =
  typeof chrome !== 'undefined' && chrome.runtime?.getURL
    ? chrome.runtime.getURL('tessdata')
    : '/tessdata'

/**
 * 在插件 popup 内调用：
 * 1. 向当前标签页的 content script 请求 .captcha-button 的图片（不重新请求 URL）
 * 2. 本地 OCR 仅识别 0-9
 * 3. 把结果发回 content script，写入 .captcha-field 下的 input
 */
export function useCaptchaOcr() {
  const recognizing = ref(false)
  const error = ref('')
  const code = ref('')
  const elapsed = ref(0)
  const source = ref('') // 'svg' = 点阵解析（精确）；'ocr' = Tesseract 兜底

  // 放大 + 灰度 + 提对比，显著提升小尺寸验证码的识别率
  async function preprocess(dataUrl, scale = 3) {
    const img = new Image()
    img.src = dataUrl
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, img.naturalWidth * scale)
    canvas.height = Math.max(1, img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.filter = 'grayscale(1) contrast(180%)'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    ctx.filter = 'none'
    return canvas.toDataURL('image/png')
  }

  async function recognizeDigits(dataUrl) {
    const worker = await createWorker('eng', 1, {
      workerPath: `${OCR_BASE}/worker.min.js`,
      workerBlobURL: false, // 用扩展内同源 worker，避开 MV3 CSP 对 blob/CDN 的限制
      langPath: OCR_BASE,
      corePath: `${OCR_BASE}/`,
      logger: () => {},
    })
    try {
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: '7', // PSM 7：单行文本
      })
      const prepared = await preprocess(dataUrl)
      const { data } = await worker.recognize(prepared)
      return (data?.text || '').replace(/\D/g, '').slice(0, 16)
    } finally {
      await worker.terminate()
    }
  }

  async function solve() {
    recognizing.value = true
    error.value = ''
    code.value = ''
    source.value = ''
    const started = Date.now()
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) throw new Error('无法获取当前标签页')

      const grab = await chrome.tabs.sendMessage(tab.id, { action: 'grabCaptcha' })
      if (!grab?.ok) throw new Error(grab?.error || '读取验证码图片失败')

      // SVG 点阵验证码：直接解析路径坐标，准确且瞬时；失败才回退 OCR
      const svgCode = decodeSvgCaptcha(grab.dataUrl)
      const digits = svgCode || (await recognizeDigits(grab.dataUrl))
      source.value = svgCode ? 'svg' : 'ocr'
      if (!digits) throw new Error('未识别到数字，请确认验证码是清晰的数字图片')

      const fill = await chrome.tabs.sendMessage(tab.id, {
        action: 'fillCaptcha',
        code: digits,
      })
      if (!fill?.ok) throw new Error(fill?.error || '填入验证码失败')

      code.value = digits
      return digits
    } catch (e) {
      error.value = e?.message || String(e)
      return ''
    } finally {
      recognizing.value = false
      elapsed.value = Date.now() - started
    }
  }

  return { recognizing, error, code, elapsed, source, solve }
}
