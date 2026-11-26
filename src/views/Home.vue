<template>
  <div class="home-shell">
    <!-- ============ 首页：工具网格 ============ -->
    <template v-if="currentView === 'home'">
      <header class="app-header material-bar">
        <div class="icon-box brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="2"></rect>
            <rect x="14" y="3" width="7" height="7" rx="2"></rect>
            <rect x="3" y="14" width="7" height="7" rx="2"></rect>
            <path d="M14.5 17.5h6M17.5 14.5v6"></path>
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="brand-title">网站部工具箱</h1>
          <p class="brand-sub">页面检查 · 内容填充 · 图片分析</p>
        </div>
        <span class="qa-badge">QA</span>
      </header>

      <div class="home-body">
        <section class="surface-card quick-card">
          <div class="icon-box" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="3"></rect>
              <path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"></path>
            </svg>
          </div>
          <div class="quick-copy">
            <strong>新标签页日历</strong>
            <span>用任务清单替换默认新标签页</span>
          </div>
          <SwitchCom :status="state.newTabTodo" @switchChange="toggleNewTabTodo" />
        </section>

        <div v-if="saveError" class="error-banner" role="alert" style="margin-top: 12px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8v4M12 16h.01"></path>
          </svg>
          <span>{{ saveError }}</span>
        </div>

        <p class="section-label">工具</p>

        <div class="tool-grid">
          <button type="button" class="tool-tile" @click="currentView = 'wordpress'">
            <span class="tile-icon is-blue" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3z"></path>
              </svg>
            </span>
            <span class="tile-title">WordPress</span>
            <span class="tile-desc">页面结构检查</span>
            <svg class="tile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
          </button>

          <button type="button" class="tool-tile" @click="currentView = 'shopify'">
            <span class="tile-icon is-green" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 8h14l-1 12H6L5 8z"></path>
                <path d="M9 9V6.7a3 3 0 016 0V9"></path>
              </svg>
            </span>
            <span class="tile-title">Shopify</span>
            <span class="tile-desc">店铺信息识别</span>
            <svg class="tile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
          </button>

          <button type="button" class="tool-tile" @click="currentView = 'images'">
            <span class="tile-icon is-orange" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3"></rect>
                <circle cx="8.5" cy="9" r="1.5"></circle>
                <path d="M4 17l5-5 3.5 3 2.5-2.5L20 17"></path>
              </svg>
            </span>
            <span class="tile-title">图片尺寸</span>
            <span class="tile-desc">采集与导出</span>
            <svg class="tile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
          </button>

          <button type="button" class="tool-tile" @click="currentView = 'captcha'">
            <span class="tile-icon is-purple" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="3"></rect>
                <path d="M7 15l3-4 2.5 3 2-2 3 3"></path>
                <circle cx="8.5" cy="10" r="1.5"></circle>
              </svg>
            </span>
            <span class="tile-title">验证码</span>
            <span class="tile-desc">自动识别填充</span>
            <svg class="tile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
          </button>
        </div>

        <p class="home-footer">网站部 · 内部工具</p>
      </div>
    </template>

    <!-- ============ 工具详情页 ============ -->
    <template v-else>
      <header class="detail-header material-bar">
        <button type="button" class="back-btn" aria-label="返回首页" @click="currentView = 'home'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
        </button>
        <h2 class="detail-title">{{ viewTitle }}</h2>
        <span class="detail-spacer"></span>
      </header>

      <main class="panel-scroll">
        <section v-if="currentView === 'wordpress'" class="panel">
          <section class="surface-card fill-card">
            <div class="card-heading">
              <div class="icon-box is-blue" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 6h16M4 12h10M4 18h7"></path>
                  <path d="M17 15l2 2 3-4"></path>
                </svg>
              </div>
              <div class="heading-copy">
                <div class="heading-title">表单自动填充</div>
                <p class="caption">一键填入 WordPress 与 WooCommerce 表单</p>
              </div>
              <SwitchCom :status="state.switchStatus" @switchChange="updateState" />
            </div>

            <details class="config-details">
              <summary>
                <span class="summary-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 7h16M4 12h16M4 17h16"></path>
                    <circle cx="9" cy="7" r="2"></circle>
                    <circle cx="15" cy="12" r="2"></circle>
                    <circle cx="8" cy="17" r="2"></circle>
                  </svg>
                  填充内容
                  <em>自动保存</em>
                </span>
                <svg class="summary-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </summary>
              <div class="config-body">
                <div class="config-grid">
                  <label class="field-label">
                    文本
                    <input v-model="formData.text" class="input-base" placeholder="例如 test" @input="scheduleSaveFormData" @change="saveFormData" />
                  </label>
                  <label class="field-label">
                    手机号
                    <input v-model="formData.tel" class="input-base" type="tel" inputmode="numeric" autocomplete="tel" placeholder="例如 13800138000" @input="scheduleSaveFormData" @change="saveFormData" />
                  </label>
                  <label class="field-label config-full">
                    邮箱
                    <input v-model="formData.email" class="input-base" type="email" inputmode="email" autocomplete="email" placeholder="例如 test@example.com" @input="scheduleSaveFormData" @change="saveFormData" />
                  </label>
                  <label class="field-label config-full">
                    留言
                    <textarea v-model="formData.textarea" class="input-base" rows="2" placeholder="例如 This is test message" @input="scheduleSaveFormData" @change="saveFormData"></textarea>
                  </label>
                </div>
                <p class="config-note">只填充当前可见的空白字段；留空的内容类型会自动跳过。</p>
              </div>
            </details>
          </section>

          <CheckWordPress />
        </section>

        <section v-else-if="currentView === 'shopify'" class="panel">
          <CheckShopify />
        </section>

        <section v-else-if="currentView === 'images'" class="panel">
          <CheckImages />
        </section>

        <section v-else-if="currentView === 'captcha'" class="panel">
          <section class="surface-card captcha-card">
            <div class="card-heading">
              <div class="icon-box is-purple" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="3"></rect>
                  <path d="M7 15l3-4 2.5 3 2-2 3 3"></path>
                  <circle cx="8.5" cy="10" r="1.5"></circle>
                </svg>
              </div>
              <div class="heading-copy">
                <div class="heading-title">验证码识别</div>
                <p class="caption">自动识别并填入当前页面</p>
              </div>
            </div>

            <div class="captcha-steps meta">
              <span>1. 页面需含 .captcha-button（内有 img）</span>
              <span>2. 页面需含 .captcha-field &gt; input</span>
            </div>

            <div class="captcha-auto-row">
              <span class="caption">自动识别填充（默认开启，无需打开插件）</span>
              <SwitchCom :status="state.captchaAutoFill" @switchChange="toggleCaptchaAuto" />
            </div>

            <button type="button" class="btn btn-primary w-full" :disabled="captchaLoading" @click="solveCaptcha">
              <svg v-if="captchaLoading" class="spinner h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="42 15"></circle>
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

            <p v-if="captchaCode" class="clean-note" role="status" aria-live="polite" aria-atomic="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
              已填入 {{ captchaCode }} · {{ captchaSource === 'svg' ? '点阵解析' : 'OCR' }} · {{ captchaElapsed }} ms
            </p>
          </section>
        </section>
      </main>
    </template>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
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

const state = reactive({
  switchStatus: false,
  newTabTodo: false,
  captchaAutoFill: true,
});

const currentView = ref("home");
const viewTitles = {
  wordpress: "WordPress",
  shopify: "Shopify",
  images: "图片尺寸",
  captcha: "验证码",
};
const viewTitle = computed(() => viewTitles[currentView.value] || "");

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
</script>
