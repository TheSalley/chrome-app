<template>
  <div class="home-shell">
    <div class="iphone-frame">
      <!-- 机身侧键 -->
      <span class="side-btn sb-mute" aria-hidden="true"></span>
      <span class="side-btn sb-vup" aria-hidden="true"></span>
      <span class="side-btn sb-vdn" aria-hidden="true"></span>
      <span class="side-btn sb-pwr" aria-hidden="true"></span>

      <div class="iphone-screen">
        <!-- 主屏壁纸（仅主屏可见，App 内为系统底色） -->
        <div
          class="wallpaper"
          :class="['wp-' + wallpaper.kind, { 'is-hidden': app !== 'home' }]"
          :style="wallpaper.kind === 'custom' ? { backgroundImage: `url(${wallpaper.value})` } : null"
          aria-hidden="true"
        ></div>

        <!-- 玻璃反光 -->
        <span class="screen-glare" aria-hidden="true"></span>

        <!-- Dynamic Island -->
        <div class="dynamic-island" aria-hidden="true">
          <span class="island-cam"></span>
        </div>

        <!-- iOS 状态栏 -->
        <div class="iphone-statusbar" aria-hidden="true">
          <span class="statusbar-time">{{ clock }}</span>
          <span class="statusbar-icons">
            <svg width="16" height="10" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
            <svg width="14" height="10" viewBox="0 0 15 11" fill="currentColor" aria-hidden="true"><path d="M7.5 11L4.8 8.3a3.9 3.9 0 015.4 0L7.5 11zM2.7 6.2a6.9 6.9 0 019.6 0L11 7.4a5 5 0 00-7 0l-1.3-1.2zM.5 4A10 10 0 0114.5 4l-1.3 1.2a8 8 0 00-11.4 0L.5 4z"/></svg>
            <svg width="23" height="10" viewBox="0 0 25 11" fill="none" aria-hidden="true"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" stroke-opacity="0.4"/><rect x="2" y="2" width="16" height="7" rx="1.5" fill="currentColor"/><path d="M22.5 3.5v4a2 2 0 000-4z" fill="currentColor" fill-opacity="0.4"/></svg>
          </span>
        </div>

        <!-- ==================== 主屏 ==================== -->
        <section class="view view-home" :class="{ 'is-pushed': app !== 'home' }">
          <nav class="nav-bar" :class="{ 'is-scrolled': scrolled }">
            <div class="nav-title-row">
              <h1 class="nav-large-title">工具箱</h1>
            </div>
            <p class="nav-sub">网站部 · 页面检查与内容填充</p>
            <span class="nav-compact-title">工具箱</span>
          </nav>

          <div class="home-body" @scroll.passive="onScroll">
            <div class="tool-grid">
              <button
                v-for="a in homeApps"
                :key="a.id"
                type="button"
                class="tool-tile"
                @click="openApp(a.id)"
              >
                <span class="tile-icon" :class="a.color" :style="a.off ? null : null" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                    <path :d="a.path"></path>
                  </svg>
                </span>
                <span class="tile-title">{{ a.label }}</span>
              </button>
            </div>

            <div class="page-dots" aria-hidden="true">
              <span class="page-dot is-active"></span>
              <span class="page-dot"></span>
            </div>

            <div v-if="saveError" class="error-banner" role="alert" style="margin-top: 12px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 8v4M12 16h.01"></path>
              </svg>
              <span>{{ saveError }}</span>
            </div>
          </div>

          <!-- Dock -->
          <div class="dock">
            <button v-for="a in dockApps" :key="a.id" type="button" class="dock-app" @click="openApp(a.id)">
              <span class="dock-icon" :class="a.color" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="a.path"></path>
                </svg>
              </span>
              <span class="dock-label">{{ a.label }}</span>
            </button>
          </div>
        </section>

        <!-- ==================== App 容器 ==================== -->
        <section class="view view-detail" :class="{ 'is-active': app !== 'home' }">
          <header class="detail-header" :class="{ 'is-scrolled': scrolled }">
            <button type="button" class="back-btn" aria-label="返回主屏" @click="closeApp">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5"></path></svg>
              <span>主屏</span>
            </button>
            <h2 class="detail-title">{{ appTitle }}</h2>
            <span class="detail-spacer"></span>
          </header>

          <main class="panel-scroll" @scroll.passive="onScroll">
            <!-- ---------- WordPress ---------- -->
            <section v-if="app === 'wordpress'" class="panel">
              <div class="app-hero">
                <span class="app-hero-icon is-blue" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3z"></path>
                  </svg>
                </span>
                <div class="app-hero-copy">
                  <h3 class="app-hero-title">页面检查</h3>
                  <p class="app-hero-sub">表单填充 · 结构检测</p>
                </div>
              </div>

              <div class="ios-group">
                <div class="ios-row">
                  <span class="row-icon is-blue" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 6h16M4 12h10M4 18h7"></path>
                      <path d="M17 15l2 2 3-4"></path>
                    </svg>
                  </span>
                  <span class="row-copy">
                    <span class="row-title">表单自动填充</span>
                    <span class="row-sub">自动填入 Elementor 表单</span>
                  </span>
                  <SwitchCom :status="state.switchStatus" @switchChange="updateState" />
                </div>
              </div>

              <p class="ios-group-label">填充内容</p>
              <div class="ios-group">
                <label class="ios-field">
                  <span class="ios-field-label">文本</span>
                  <input v-model="formData.text" class="ios-input" placeholder="test" @input="scheduleSaveFormData" @change="saveFormData" />
                </label>
                <label class="ios-field">
                  <span class="ios-field-label">手机号</span>
                  <input v-model="formData.tel" class="ios-input" type="tel" inputmode="numeric" autocomplete="tel" placeholder="13800138000" @input="scheduleSaveFormData" @change="saveFormData" />
                </label>
                <label class="ios-field">
                  <span class="ios-field-label">邮箱</span>
                  <input v-model="formData.email" class="ios-input" type="email" inputmode="email" autocomplete="email" placeholder="test@example.com" @input="scheduleSaveFormData" @change="saveFormData" />
                </label>
                <label class="ios-field">
                  <span class="ios-field-label">留言</span>
                  <textarea v-model="formData.textarea" class="ios-input" rows="2" placeholder="This is test message" @input="scheduleSaveFormData" @change="saveFormData"></textarea>
                </label>
              </div>
              <p class="ios-footnote">只填充当前可见的空白字段；留空的内容类型会自动跳过。</p>

              <CheckWordPress />
            </section>

            <!-- ---------- Shopify ---------- -->
            <section v-else-if="app === 'shopify'" class="panel">
              <div class="app-hero">
                <span class="app-hero-icon is-green" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 8h14l-1 12H6L5 8z"></path>
                    <path d="M9 9V6.7a3 3 0 016 0V9"></path>
                  </svg>
                </span>
                <div class="app-hero-copy">
                  <h3 class="app-hero-title">店铺识别</h3>
                  <p class="app-hero-sub">域名 · 主题 · 店铺信息</p>
                </div>
              </div>
              <CheckShopify />
            </section>

            <!-- ---------- 图片 ---------- -->
            <section v-else-if="app === 'images'" class="panel">
              <div class="app-hero">
                <span class="app-hero-icon is-orange" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="3"></rect>
                    <circle cx="8.5" cy="9" r="1.5"></circle>
                    <path d="M4 17l5-5 3.5 3 2.5-2.5L20 17"></path>
                  </svg>
                </span>
                <div class="app-hero-copy">
                  <h3 class="app-hero-title">图片尺寸</h3>
                  <p class="app-hero-sub">采集 · 导出 JSON / Excel</p>
                </div>
              </div>
              <CheckImages />
            </section>

            <!-- ---------- 验证码 ---------- -->
            <section v-else-if="app === 'captcha'" class="panel">
              <div class="app-hero">
                <span class="app-hero-icon is-purple" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="16" rx="3"></rect>
                    <path d="M7 15l3-4 2.5 3 2-2 3 3"></path>
                    <circle cx="8.5" cy="10" r="1.5"></circle>
                  </svg>
                </span>
                <div class="app-hero-copy">
                  <h3 class="app-hero-title">验证码识别</h3>
                  <p class="app-hero-sub">自动识别并填入当前页面</p>
                </div>
              </div>

              <div class="ios-group">
                <div class="ios-row">
                  <span class="row-copy">
                    <span class="row-title">自动识别填充</span>
                    <span class="row-sub">页面加载后自动运行</span>
                  </span>
                  <SwitchCom :status="state.captchaAutoFill" @switchChange="toggleCaptchaAuto" />
                </div>
              </div>

              <button type="button" class="ios-btn-primary" :disabled="captchaLoading" @click="solveCaptcha">
                <svg v-if="captchaLoading" class="spinner" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="42 15"></circle>
                </svg>
                {{ captchaLoading ? '识别中…' : '识别并填入' }}
              </button>

              <div v-if="captchaError" class="error-banner" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 8v4M12 16h.01"></path>
                </svg>
                <span>{{ captchaError }}</span>
              </div>

              <div v-if="captchaCode" class="ios-group" role="status" aria-live="polite" aria-atomic="true">
                <div class="ios-row">
                  <span class="row-icon is-green" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </span>
                  <span class="row-copy">
                    <span class="row-title">已填入 {{ captchaCode }}</span>
                    <span class="row-sub">{{ captchaSource === 'svg' ? '点阵解析' : 'OCR' }} · {{ captchaElapsed }} ms</span>
                  </span>
                </div>
              </div>

              <p class="ios-group-label">页面要求</p>
              <div class="ios-group">
                <div class="ios-row">
                  <span class="row-copy">
                    <span class="row-title">.captcha-button</span>
                    <span class="row-sub">内含验证码图片 img</span>
                  </span>
                </div>
                <div class="ios-row">
                  <span class="row-copy">
                    <span class="row-title">.captcha-field</span>
                    <span class="row-sub">内含待填写的 input</span>
                  </span>
                </div>
              </div>
            </section>

            <!-- ---------- 日历 ---------- -->
            <section v-else-if="app === 'calendar'" class="panel">
              <div class="app-hero">
                <span class="app-hero-icon is-red" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="16" rx="3"></rect>
                    <path d="M8 3v4M16 3v4M3 10h18"></path>
                  </svg>
                </span>
                <div class="app-hero-copy">
                  <h3 class="app-hero-title">新标签页日历</h3>
                  <p class="app-hero-sub">用任务清单替换新标签页</p>
                </div>
              </div>

              <div class="ios-group">
                <div class="ios-row">
                  <span class="row-copy">
                    <span class="row-title">启用新标签页</span>
                    <span class="row-sub">打开新标签页时显示任务清单</span>
                  </span>
                  <SwitchCom :status="state.newTabTodo" @switchChange="toggleNewTabTodo" />
                </div>
              </div>

              <div class="calendar-preview">
                <div class="cal-head">
                  <span class="cal-month">{{ calendarMonth }}</span>
                  <span class="cal-today">{{ calendarToday }}</span>
                </div>
                <div class="cal-week">
                  <span v-for="d in ['日','一','二','三','四','五','六']" :key="d">{{ d }}</span>
                </div>
                <div class="cal-grid">
                  <span
                    v-for="(cell, i) in calendarCells"
                    :key="i"
                    class="cal-cell"
                    :class="{ 'is-empty': !cell.day, 'is-today': cell.isToday }"
                  >{{ cell.day }}</span>
                </div>
              </div>
            </section>

            <!-- ---------- 设置 ---------- -->
            <section v-else-if="app === 'settings'" class="panel">
              <div class="app-hero">
                <span class="app-hero-icon is-gray" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"></path>
                  </svg>
                </span>
                <div class="app-hero-copy">
                  <h3 class="app-hero-title">设置</h3>
                  <p class="app-hero-sub">外观 · 通用 · 关于</p>
                </div>
              </div>

              <p class="ios-group-label">外观</p>
              <div class="ios-group">
                <button type="button" class="ios-row is-tappable" @click="openWallpaperPicker">
                  <span class="row-icon is-orange" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="16" rx="3"></rect>
                      <circle cx="8.5" cy="9" r="1.5"></circle>
                      <path d="M4 17l5-5 3.5 3 2.5-2.5L20 17"></path>
                    </svg>
                  </span>
                  <span class="row-copy">
                    <span class="row-title">壁纸</span>
                    <span class="row-sub">{{ wallpaperName }}</span>
                  </span>
                  <span class="wallpaper-thumb" :class="'wp-' + wallpaper.kind" :style="wallpaper.kind === 'custom' ? { backgroundImage: `url(${wallpaper.value})` } : null" aria-hidden="true"></span>
                  <svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
                </button>
              </div>

              <p class="ios-group-label">通用</p>
              <div class="ios-group">
                <div class="ios-row">
                  <span class="row-copy">
                    <span class="row-title">新标签页日历</span>
                    <span class="row-sub">用任务清单替换默认新标签页</span>
                  </span>
                  <SwitchCom :status="state.newTabTodo" @switchChange="toggleNewTabTodo" />
                </div>
                <div class="ios-row">
                  <span class="row-copy">
                    <span class="row-title">验证码自动填充</span>
                    <span class="row-sub">页面加载后自动识别</span>
                  </span>
                  <SwitchCom :status="state.captchaAutoFill" @switchChange="toggleCaptchaAuto" />
                </div>
              </div>

              <p class="ios-group-label">关于</p>
              <div class="ios-group">
                <div class="ios-row">
                  <span class="row-copy">
                    <span class="row-title">网站部工具箱</span>
                    <span class="row-sub">版本 1.0.0</span>
                  </span>
                  <span class="row-value">QA</span>
                </div>
              </div>

              <p class="home-footer">网站部 · 内部工具</p>
            </section>
          </main>
        </section>

        <!-- ============ 壁纸选择面板 ============ -->
        <transition name="sheet">
          <div v-if="wallpaperPickerOpen" class="sheet-mask" @click.self="closeWallpaperPicker">
            <div class="sheet" role="dialog" aria-label="更换壁纸">
              <div class="sheet-handle" aria-hidden="true"></div>

              <div class="sheet-head">
                <h3 class="sheet-title">更换壁纸</h3>
                <button type="button" class="sheet-done" @click="closeWallpaperPicker">完成</button>
              </div>

              <p class="sheet-label">内置</p>
              <div class="wp-grid">
                <button
                  v-for="p in wallpaperPresets"
                  :key="p.id"
                  type="button"
                  class="wp-swatch"
                  :class="['wp-' + p.id, { 'is-active': wallpaper.kind === p.id }]"
                  :aria-label="p.name"
                  @click="chooseWallpaper(p.id)"
                >
                  <span v-if="wallpaper.kind === p.id" class="wp-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                  </span>
                </button>
              </div>

              <p class="sheet-label">自定义</p>
              <div class="wp-actions">
                <button type="button" class="wp-action" @click="pickImage">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 16V4M7 9l5-5 5 5"></path>
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"></path>
                  </svg>
                  从本地选择图片
                </button>
                <button v-if="wallpaper.kind === 'custom'" type="button" class="wp-action is-danger" @click="resetWallpaper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"></path>
                  </svg>
                  恢复默认壁纸
                </button>
              </div>

              <p v-if="wallpaperError" class="sheet-error" role="alert">{{ wallpaperError }}</p>

              <input ref="fileInput" type="file" accept="image/*" class="hidden-file" @change="onFileChange" />
            </div>
          </div>
        </transition>

        <!-- Home 指示条 -->
        <div class="home-indicator-wrap" aria-hidden="true">
          <span class="home-indicator"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from "vue";
import SwitchCom from "@/components/SwitchCom.vue";
import CheckShopify from "@/components/CheckShopify.vue";
import CheckImages from "@/components/CheckImages.vue";
import CheckWordPress from "@/components/CheckWordPress.vue";
import { getStorage, setStorage } from "@/utils/index.js";
import { DEFAULT_FORM_DATA, FORM_DATA_KEY, normalizeFormData } from "@/utils/formData.js";
import { useCaptchaOcr } from "@/composables/useCaptchaOcr.js";

const {
  recognizing: captchaLoading,
  error: captchaError,
  code: captchaCode,
  elapsed: captchaElapsed,
  source: captchaSource,
  solve: solveCaptcha,
} = useCaptchaOcr();

/* ---------- 状态栏实时时钟 ---------- */
const clock = ref("");
let clockTimer = null;
function tickClock() {
  const now = new Date();
  clock.value = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/* ---------- 壁纸 ---------- */
const WALLPAPER_KEY = "wallpaper";
const wallpaperPresets = [
  { id: "default", name: "默认" },
  { id: "aurora", name: "极光" },
  { id: "sunset", name: "日落" },
  { id: "ocean", name: "深海" },
  { id: "mono", name: "石墨" },
];
const wallpaper = reactive({ kind: "default", value: "" });
const wallpaperPickerOpen = ref(false);
const wallpaperError = ref("");
const fileInput = ref(null);
const wallpaperName = computed(() => {
  if (wallpaper.kind === "custom") return "自定义图片";
  const p = wallpaperPresets.find((x) => x.id === wallpaper.kind);
  return p ? p.name : "默认";
});

function openWallpaperPicker() {
  wallpaperPickerOpen.value = true;
  wallpaperError.value = "";
}
function closeWallpaperPicker() {
  wallpaperPickerOpen.value = false;
}

async function chooseWallpaper(kind) {
  wallpaper.kind = kind;
  wallpaper.value = "";
  wallpaperError.value = "";
  if (!(await setStorage(WALLPAPER_KEY, { kind, value: "" }))) {
    wallpaperError.value = "壁纸保存失败";
  }
}

function pickImage() {
  wallpaperError.value = "";
  fileInput.value?.click();
}

// 压缩后再存，避免超出 storage.local 配额
async function onFileChange(e) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    wallpaperError.value = "请选择图片文件";
    return;
  }
  try {
    const dataUrl = await compressImage(file, 720, 0.82);
    wallpaper.kind = "custom";
    wallpaper.value = dataUrl;
    wallpaperError.value = "";
    if (!(await setStorage(WALLPAPER_KEY, { kind: "custom", value: dataUrl }))) {
      wallpaperError.value = "图片过大，保存失败，请换一张";
      await loadWallpaper();
    }
  } catch {
    wallpaperError.value = "图片读取失败，请重试";
  }
}

function compressImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function resetWallpaper() {
  await chooseWallpaper("default");
}

async function loadWallpaper() {
  const saved = await getStorage(WALLPAPER_KEY);
  if (saved && typeof saved === "object" && saved.kind) {
    wallpaper.kind = saved.kind;
    wallpaper.value = saved.value || "";
  }
}

/* ---------- 应用列表 ---------- */
const homeApps = [
  {
    id: "wordpress",
    label: "WordPress",
    color: "is-blue",
    path: "M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3zM3 12a9 9 0 0018 0 9 9 0 00-18 0z",
  },
  {
    id: "shopify",
    label: "Shopify",
    color: "is-green",
    path: "M5 8h14l-1 12H6L5 8zM9 9V6.7a3 3 0 016 0V9",
  },
  {
    id: "images",
    label: "图片尺寸",
    color: "is-orange",
    path: "M3 7a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H6a3 3 0 01-3-3V7zM3 16l5-5 3.5 3 2.5-2.5L21 16M9 9.5a1 1 0 11-2 0 1 1 0 012 0z",
  },
  {
    id: "captcha",
    label: "验证码",
    color: "is-purple",
    path: "M4 8a3 3 0 013-3h10a3 3 0 013 3v8a3 3 0 01-3 3H7a3 3 0 01-3-3V8zM7 14l2.5-3 2 2.5 1.5-1.5L17 14M9 10.5a1 1 0 11-2 0 1 1 0 012 0z",
  },
  {
    id: "calendar",
    label: "日历",
    color: "is-red",
    path: "M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7zM8 3v4M16 3v4M4 10h16",
  },
  {
    id: "settings",
    label: "设置",
    color: "is-gray",
    path: "M12 15a3 3 0 100-6 3 3 0 000 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1",
  },
];

const dockApps = [
  {
    id: "calendar",
    label: "日历",
    color: "is-calendar",
    path: "M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7zM8 3v4M16 3v4M4 10h16",
  },
  {
    id: "captcha",
    label: "验证码",
    color: "is-captcha",
    path: "M4 8a3 3 0 013-3h10a3 3 0 013 3v8a3 3 0 01-3 3H7a3 3 0 01-3-3V8zM7 14l2.5-3 2 2.5 1.5-1.5L17 14M9 10.5a1 1 0 11-2 0 1 1 0 012 0z",
  },
  {
    id: "images",
    label: "图片",
    color: "is-images",
    path: "M3 7a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H6a3 3 0 01-3-3V7zM3 16l5-5 3.5 3 2.5-2.5L21 16M9 9.5a1 1 0 11-2 0 1 1 0 012 0z",
  },
  {
    id: "settings",
    label: "设置",
    color: "is-settings",
    path: "M12 15a3 3 0 100-6 3 3 0 000 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1",
  },
];

/* ---------- 应用导航 ---------- */
const app = ref("home");
const scrolled = ref(false);
const appTitles = {
  wordpress: "WordPress",
  shopify: "Shopify",
  images: "图片尺寸",
  captcha: "验证码",
  calendar: "日历",
  settings: "设置",
};
const appTitle = computed(() => appTitles[app.value] || "");
function openApp(id) {
  app.value = id;
  scrolled.value = false;
}
function closeApp() {
  app.value = "home";
  scrolled.value = false;
}
function onScroll(e) {
  scrolled.value = e.target.scrollTop > 12;
}

/* ---------- 日历预览 ---------- */
const calendarToday = computed(() => {
  const now = new Date();
  return `${now.getMonth() + 1}月${now.getDate()}日`;
});
const calendarMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月`;
});
const calendarCells = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push({ day: "", isToday: false });
  for (let d = 1; d <= days; d++) cells.push({ day: d, isToday: d === now.getDate() });
  return cells;
});

/* ---------- 业务状态 ---------- */
const state = reactive({
  switchStatus: false,
  newTabTodo: false,
  captchaAutoFill: true,
});

const NEW_TAB_TODO_KEY = "newTabTodo";
const saveError = ref("");
const formData = reactive({ ...DEFAULT_FORM_DATA });
let formSaveTimer = null;

async function saveFormData() {
  clearTimeout(formSaveTimer);
  formSaveTimer = null;
  saveError.value = "";
  if (!(await setStorage(FORM_DATA_KEY, { ...formData }))) {
    saveError.value = "填充内容保存失败，请重试";
  }
}

function scheduleSaveFormData() {
  clearTimeout(formSaveTimer);
  formSaveTimer = setTimeout(saveFormData, 300);
}

async function updateState(data) {
  const previous = state.switchStatus;
  saveError.value = "";
  if (formSaveTimer) await saveFormData();
  state.switchStatus = data;
  if (!(await setStorage("switchStatus", data))) {
    state.switchStatus = previous;
    saveError.value = "设置保存失败，请重试";
  }
}

async function toggleNewTabTodo(checked) {
  const previous = state.newTabTodo;
  state.newTabTodo = checked;
  saveError.value = "";
  if (!(await setStorage(NEW_TAB_TODO_KEY, checked))) {
    state.newTabTodo = previous;
    saveError.value = "设置保存失败，请重试";
  }
}

async function toggleCaptchaAuto(checked) {
  const previous = state.captchaAutoFill;
  state.captchaAutoFill = checked;
  saveError.value = "";
  if (!(await setStorage("captchaAutoFill", checked))) {
    state.captchaAutoFill = previous;
    saveError.value = "设置保存失败，请重试";
  }
}

onMounted(async () => {
  tickClock();
  clockTimer = setInterval(tickClock, 1000);
  loadWallpaper();

  const [switchRes, newTabRes, formRes, captchaAutoRes] = await Promise.all([
    getStorage("switchStatus"),
    getStorage(NEW_TAB_TODO_KEY),
    getStorage(FORM_DATA_KEY),
    getStorage("captchaAutoFill"),
  ]);
  state.switchStatus = switchRes ?? false;
  state.newTabTodo = newTabRes ?? false;
  state.captchaAutoFill = captchaAutoRes ?? true;
  Object.assign(formData, normalizeFormData(formRes));
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});
</script>
