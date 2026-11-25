<template>
  <div class="home-shell">
    <header class="app-header material-bar">
      <div class="icon-box" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="2"></rect>
          <rect x="14" y="3" width="7" height="7" rx="2"></rect>
          <rect x="3" y="14" width="7" height="7" rx="2"></rect>
          <path d="M14.5 17.5h6M17.5 14.5v6"></path>
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h1 class="truncate text-apple-headline text-system-label">网站部工具箱</h1>
          <span class="shrink-0 rounded-full px-2 py-0.5 text-apple-caption2 font-semibold text-system-label3" style="background: var(--color-system-fill)">QA</span>
        </div>
        <p class="caption truncate">页面检查、内容填充与图片分析</p>
      </div>
    </header>

    <div class="home-main">
      <section class="surface-card quick-card">
        <div class="icon-box is-blue" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="3"></rect>
            <path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"></path>
          </svg>
        </div>
        <div class="quick-copy">
          <strong class="text-apple-subhead font-semibold text-system-label">新标签页日历</strong>
          <span class="caption">用任务清单替换默认新标签页</span>
        </div>
        <SwitchCom
          :status="state.newTabTodo"
          @switchChange="toggleNewTabTodo"
        />
      </section>

      <div v-if="saveError" class="error-banner" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 8v4M12 16h.01"></path>
        </svg>
        <span>{{ saveError }}</span>
      </div>

      <nav class="segmented" role="tablist" aria-label="工具切换">
        <button
          id="tab-wordpress"
          type="button"
          class="segment"
          role="tab"
          :aria-selected="activeTab === 'wordpress'"
          aria-controls="panel-wordpress"
          @click="activeTab = 'wordpress'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3z"></path>
          </svg>
          <span>WordPress</span>
        </button>
        <button
          id="tab-shopify"
          type="button"
          class="segment"
          role="tab"
          :aria-selected="activeTab === 'shopify'"
          aria-controls="panel-shopify"
          @click="activeTab = 'shopify'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 8h14l-1 12H6L5 8z"></path>
            <path d="M9 9V6.7a3 3 0 016 0V9"></path>
          </svg>
          <span>Shopify</span>
        </button>
        <button
          id="tab-images"
          type="button"
          class="segment"
          role="tab"
          :aria-selected="activeTab === 'images'"
          aria-controls="panel-images"
          @click="activeTab = 'images'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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
              <SwitchCom
                :status="state.switchStatus"
                @switchChange="updateState"
              />
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
