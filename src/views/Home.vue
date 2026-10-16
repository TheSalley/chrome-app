<template>
  <div class="card">
    <div class="flex items-center justify-between mb-3 px-1">
      <span class="text-[13px] text-gray-700">新标签页显示日历 Todo</span>
      <label class="todo-switch">
        <input type="checkbox" :checked="state.newTabTodo" @change="toggleNewTabTodo($event.target.checked)" />
        <span class="todo-switch-track"><span class="todo-switch-thumb"></span></span>
      </label>
    </div>
    <Tabs value="0">
      <TabList>
        <Tab value="0">WordPress</Tab>
        <Tab value="1">Shopify</Tab>
        <Tab value="2">图片尺寸</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <div class="flex items-center mb-4">
            <span>表单自动填充</span>
            <SwitchCom
              :status="state.switchStatus"
              @switchChange="updateState"
            />
          </div>
          <button
            class="cursor-pointer mb-4 transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
            @click="handleSave"
          >
            保存
          </button>
          <CheckWordPress />
        </TabPanel>
        <TabPanel value="1">
          <CheckShopify />
        </TabPanel>
        <TabPanel value="2">
          <CheckImages />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import SwitchCom from "@/components/SwitchCom.vue";
import CheckShopify from "@/components/CheckShopify.vue";
import CheckImages from "@/components/CheckImages.vue";
import CheckWordPress from "@/components/CheckWordPress.vue";
import { getStorage, setStorage } from "@/utils/index.js";

const state = reactive({
  switchStatus: false,
  newTabTodo: false,
});

const NEW_TAB_TODO_KEY = "newTabTodo";

function updateState(data) {
  state.switchStatus = data;
}

async function handleSave() {
  await setStorage("switchStatus", state.switchStatus);
}

async function applyNewTabTodo(enabled) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) return;

  const tabUrl = tab.url.split("?")[0].split("#")[0];
  const calendarUrl = chrome.runtime.getURL("calendar.html");

  if (enabled) {
    // 开启：当前标签页若是默认新标签页，立即切换为日历 Todo 页
    if (tabUrl === "chrome://newtab/" || tabUrl === "edge://newtab/") {
      await chrome.tabs.update(tab.id, { url: calendarUrl });
    }
  } else if (tabUrl === calendarUrl) {
    // 关闭：当前标签页若是日历 Todo 页，改回默认新标签页
    await chrome.tabs.update(tab.id, { url: "chrome://newtab/" });
  }
}

async function toggleNewTabTodo(checked) {
  state.newTabTodo = checked;
  await setStorage(NEW_TAB_TODO_KEY, checked);
  await applyNewTabTodo(checked);
}

onMounted(async () => {
  const res = await getStorage("switchStatus");
  updateState(res ?? false);
  if (res === true) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: "popupOpened", data: { isChecked: true } });
      } catch (_) {}
    }
  }

  const newTabRes = await getStorage(NEW_TAB_TODO_KEY);
  state.newTabTodo = newTabRes ?? false;
});
</script>

<style scoped>
.todo-switch {
  position: relative;
  display: inline-block;
  flex: none;
}
.todo-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.todo-switch-track {
  display: block;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: #cbd5e1;
  transition: background .18s;
  cursor: pointer;
}
.todo-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.25);
  transition: transform .18s;
}
.todo-switch input:checked + .todo-switch-track {
  background: #3b82f6;
}
.todo-switch input:checked + .todo-switch-track .todo-switch-thumb {
  transform: translateX(16px);
}
</style>