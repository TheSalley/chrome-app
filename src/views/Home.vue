<template>
  <div class="home-shell">
    <header class="app-header">
      <div class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="2"></rect>
          <rect x="14" y="3" width="7" height="7" rx="2"></rect>
          <rect x="3" y="14" width="7" height="7" rx="2"></rect>
          <path d="M14.5 17.5h6M17.5 14.5v6"></path>
        </svg>
      </div>
      <div class="brand-copy">
        <div class="brand-line">
          <h1>网站部工具箱</h1>
          <span>QA</span>
        </div>
        <p>页面检查、内容填充与图片分析</p>
      </div>
    </header>

    <div class="home-main">
      <section class="surface-card quick-card">
        <div class="quick-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="3"></rect>
            <path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"></path>
          </svg>
        </div>
        <div class="quick-copy">
          <strong>新标签页日历</strong>
          <span>用任务清单替换默认新标签页</span>
        </div>
        <SwitchCom
          :status="state.newTabTodo"
          @switchChange="toggleNewTabTodo"
        />
      </section>

      <div v-if="saveError" class="error-banner" role="alert">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 8v4M12 16h.01"></path>
        </svg>
        <span>{{ saveError }}</span>
      </div>

      <nav class="tab-bar" role="tablist" aria-label="工具切换">
        <button
          id="tab-wordpress"
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'wordpress' }"
          role="tab"
          :aria-selected="activeTab === 'wordpress'"
          aria-controls="panel-wordpress"
          @click="activeTab = 'wordpress'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3z"></path>
          </svg>
          <span>WordPress</span>
        </button>
        <button
          id="tab-shopify"
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'shopify' }"
          role="tab"
          :aria-selected="activeTab === 'shopify'"
          aria-controls="panel-shopify"
          @click="activeTab = 'shopify'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 8h14l-1 12H6L5 8z"></path>
            <path d="M9 9V6.7a3 3 0 016 0V9"></path>
          </svg>
          <span>Shopify</span>
        </button>
        <button
          id="tab-images"
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'images' }"
          role="tab"
          :aria-selected="activeTab === 'images'"
          aria-controls="panel-images"
          @click="activeTab = 'images'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="3"></rect>
            <circle cx="8.5" cy="9" r="1.5"></circle>
            <path d="M4 17l5-5 3.5 3 2.5-2.5L20 17"></path>
          </svg>
          <span>图片尺寸</span>
        </button>
      </nav>

      <main class="panel-scroll">
        <section
          v-show="activeTab === 'wordpress'"
          id="panel-wordpress"
          class="panel"
          role="tabpanel"
          aria-labelledby="tab-wordpress"
        >
          <section class="surface-card fill-card">
            <div class="card-heading">
              <div class="heading-icon is-blue" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 6h16M4 12h10M4 18h7"></path>
                  <path d="M17 15l2 2 3-4"></path>
                </svg>
              </div>
              <div class="heading-copy">
                <div class="heading-title">表单自动填充</div>
                <p>一键填入 WordPress 与 WooCommerce 表单</p>
              </div>
              <SwitchCom
                :status="state.switchStatus"
                @switchChange="updateState"
              />
            </div>

            <details class="config-details">
              <summary>
                <span class="summary-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 7h16M4 12h16M4 17h16"></path>
                    <circle cx="9" cy="7" r="2"></circle>
                    <circle cx="15" cy="12" r="2"></circle>
                    <circle cx="8" cy="17" r="2"></circle>
                  </svg>
                  填充内容
                  <em>自动保存</em>
                </span>
                <svg class="summary-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </summary>
              <div class="config-body">
                <div class="config-grid">
                  <label class="field-label">
                    文本
                    <input
                      v-model="formData.text"
                      class="input-base"
                      placeholder="例如 test"
                      @input="scheduleSaveFormData"
                      @change="saveFormData"
                    />
                  </label>
                  <label class="field-label">
                    手机号
                    <input
                      v-model="formData.tel"
                      class="input-base"
                      placeholder="例如 13800138000"
                      @input="scheduleSaveFormData"
                      @change="saveFormData"
                    />
                  </label>
                  <label class="field-label config-full">
                    邮箱
                    <input
                      v-model="formData.email"
                      class="input-base"
                      placeholder="例如 test@example.com"
                      @input="scheduleSaveFormData"
                      @change="saveFormData"
                    />
                  </label>
                  <label class="field-label config-full">
                    留言
                    <textarea
                      v-model="formData.textarea"
                      class="input-base"
                      rows="2"
                      placeholder="例如 This is test message"
                      @input="scheduleSaveFormData"
                      @change="saveFormData"
                    ></textarea>
                  </label>
                </div>
                <p class="config-note">只填充当前可见的空白字段；留空的内容类型会自动跳过。</p>
              </div>
            </details>
          </section>

          <CheckWordPress />
        </section>

        <section
          v-show="activeTab === 'shopify'"
          id="panel-shopify"
          class="panel"
          role="tabpanel"
          aria-labelledby="tab-shopify"
        >
          <CheckShopify />
        </section>

        <section
          v-show="activeTab === 'images'"
          id="panel-images"
          class="panel"
          role="tabpanel"
          aria-labelledby="tab-images"
        >
          <CheckImages />
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import SwitchCom from "@/components/SwitchCom.vue";
import CheckShopify from "@/components/CheckShopify.vue";
import CheckImages from "@/components/CheckImages.vue";
import CheckWordPress from "@/components/CheckWordPress.vue";
import { getStorage, setStorage } from "@/utils/index.js";
import { DEFAULT_FORM_DATA, FORM_DATA_KEY, normalizeFormData } from "@/utils/formData.js";

const state = reactive({
  switchStatus: false,
  newTabTodo: false,
});

const activeTab = ref("wordpress");
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

onMounted(async () => {
  const [switchRes, newTabRes, formRes] = await Promise.all([
    getStorage("switchStatus"),
    getStorage(NEW_TAB_TODO_KEY),
    getStorage(FORM_DATA_KEY),
  ]);
  state.switchStatus = switchRes ?? false;
  state.newTabTodo = newTabRes ?? false;
  Object.assign(formData, normalizeFormData(formRes));
});
</script>

<style scoped>
.home-shell {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  background:
    radial-gradient(circle at 88% -4%, rgba(37, 99, 235, 0.09), transparent 34%),
    radial-gradient(circle at 4% 108%, rgba(14, 165, 233, 0.05), transparent 30%),
    var(--app-bg);
}

.app-header {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
  padding: 12px 15px 11px;
  border-bottom: 1px solid rgba(219, 228, 240, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(252, 254, 255, 0.88) 100%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.85) inset;
  backdrop-filter: blur(14px);
}

.brand-mark {
  display: flex;
  width: 36px;
  height: 36px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 11px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent 46%),
    linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.26), 0 5px 14px rgba(37, 99, 235, 0.22);
}

.brand-mark svg {
  width: 19px;
  height: 19px;
}

.brand-copy {
  min-width: 0;
  flex: 1;
}

.brand-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-line h1 {
  margin: 0;
  color: var(--text);
  font-size: 14.5px;
  font-weight: 750;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.brand-line span {
  padding: 2.5px 6px;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary-strong);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.brand-copy p {
  margin: 2px 0 0;
  overflow: hidden;
  color: var(--muted);
  font-size: 10.5px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-main {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  padding: 10px 14px 0;
}

.quick-card {
  display: flex;
  flex: none;
  align-items: center;
  gap: 9px;
  padding: 9px 11px;
  border-color: #e2eaf4;
  border-radius: 14px;
  background:
    radial-gradient(circle at 95% 0%, rgba(37, 99, 235, 0.06), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 1px 2px rgba(23, 32, 51, 0.025), 0 8px 20px rgba(23, 32, 51, 0.045);
}

.quick-icon {
  display: flex;
  width: 29px;
  height: 29px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: linear-gradient(180deg, #f8fbff 0%, var(--primary-soft) 100%);
  color: var(--primary);
  box-shadow: inset 0 1px 0 #fff;
}

.quick-icon svg {
  width: 15px;
  height: 15px;
}

.quick-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.quick-copy strong {
  color: var(--text);
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.25;
}

.quick-copy span {
  overflow: hidden;
  color: var(--muted);
  font-size: 10.5px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-icon {
  width: 14px;
  height: 14px;
  flex: none;
  margin-top: 1px;
}

.tab-bar {
  display: grid;
  flex: none;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  margin: 9px 0 10px;
  padding: 4px;
  border: 1px solid #e1e8f2;
  border-radius: 13px;
  background: linear-gradient(180deg, #f8fafc 0%, #f2f6fa 100%);
  box-shadow: inset 0 1px 0 #fff, inset 0 -1px 2px rgba(23, 32, 51, 0.03);
}

.tab-button {
  display: flex;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 5px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #5f6b7d;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;
}

.tab-button svg {
  width: 14px;
  height: 14px;
  flex: none;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.56);
  color: var(--text-soft);
}

.tab-button.active {
  border-color: #d6e3f4;
  background: linear-gradient(180deg, #ffffff 0%, #f5f9ff 100%);
  color: var(--primary-strong);
  box-shadow: inset 0 1px 0 #fff, inset 0 0 0 1px rgba(59, 130, 246, 0.06), 0 3px 9px rgba(23, 32, 51, 0.08);
}

.tab-button:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.32);
  outline-offset: 1px;
}

.panel-scroll {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 0 2px 16px;
  scrollbar-gutter: stable;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fill-card {
  padding: 14px;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.heading-icon {
  display: flex;
  width: 34px;
  height: 34px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 10px;
}

.heading-icon svg {
  width: 18px;
  height: 18px;
}

.heading-icon.is-blue {
  border-color: #dbeafe;
  background: linear-gradient(180deg, #f8fbff 0%, var(--primary-soft) 100%);
  color: var(--primary);
  box-shadow: inset 0 1px 0 #fff;
}

.heading-copy {
  min-width: 0;
  flex: 1;
}

.heading-title {
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.heading-copy p {
  margin: 3px 0 0;
  overflow: hidden;
  color: var(--muted);
  font-size: 10.5px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-details {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--line);
}

.config-details summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 650;
  list-style: none;
  cursor: pointer;
  user-select: none;
}

.config-details summary::-webkit-details-marker {
  display: none;
}

.summary-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.summary-label svg {
  width: 14px;
  height: 14px;
  color: var(--muted);
}

.summary-label em {
  padding: 2px 5px;
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--subtle);
  font-size: 9.5px;
  font-style: normal;
  font-weight: 650;
}

.summary-chevron {
  width: 14px;
  height: 14px;
  flex: none;
  color: var(--subtle);
  transition: transform 0.18s ease;
}

.config-details[open] .summary-chevron {
  transform: rotate(180deg);
}

.config-body {
  padding-top: 11px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.config-full {
  grid-column: 1 / -1;
}

.config-note {
  margin: 9px 0 0;
  color: var(--subtle);
  font-size: 10px;
  line-height: 1.5;
}
</style>
