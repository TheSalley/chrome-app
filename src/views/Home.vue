<template>
  <div class="card">
    <Tabs value="0">
      <TabList>
        <Tab value="0">WordPress</Tab>
        <Tab value="1">Shopify</Tab>
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
          <div class="flex items-center">
            <span>检查全站按钮是否有效</span>
            <CheckButtons />
          </div>
          <button
            class="cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
            @click="handleSave"
          >
            保存
          </button>
        </TabPanel>
        <TabPanel value="1"> </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import SwitchCom from "@/components/SwitchCom.vue";
import CheckButtons from "@/components/CheckButtons.vue";
import { getStorage, setStorage } from "@/utils/index.js";

const state = reactive({
  switchStatus: false,
});

async function updateState(data) {
  state.switchStatus = data;
}

async function handleSave() {
  console.log(state);
  await setStorage("switchStatus", state.switchStatus);
}

onMounted(async () => {
  const res = await getStorage("switchStatus");
  updateState(res);
});
</script>
