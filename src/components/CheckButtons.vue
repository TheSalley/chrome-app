<template>
<div>
  <button @click="checkButtons" class="w-[50px]">
    <span class="text">RUN</span>
    <span>Disable!</span>
  </button>
</div>
  <div v-if="checked" class="result">
      页面上有 <strong>{{ disabledCount }}</strong> 个按钮不生效
    </div>
</template>
<script setup>
import { ref } from 'vue';
const disabledCount=ref(0);
const checked = ref(false); // 用来显示结果
async function checkButtons() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { action: 'checkButtons' }, (response) => {
      if (response?.ok){
        disabledCount.value=response.disabledCount;
        checked.value=true;
      }else{
        console.log("全部正常");
        disabledCount.value=0;
        checked.value=true;
      }
      })

}
</script>


<style scoped>
 
 .result {
  font-family: 'Orbitron', sans-serif; /* 科技感字体 */
  font-size: 15px;
  font-weight: 700;
  color: #111827; 
  letter-spacing: 0.5px;
  text-transform: uppercase; /* 全大写（看起来更科幻） */
}
button {
  display: flex;
  flex-direction: column; /* 上下排列 */
  align-items: center;
  justify-content: center;
    margin-top: 10px;
  width: 50px;
  padding: 14px 18px;
  border-radius: 12px;
  font-weight: 600;

  color: #fff;
  background: linear-gradient(135deg, #6366f1, #4f46e5); /* 紫色渐变 */
  border: none;
  cursor: pointer;

  box-shadow: 0 6px 14px rgba(99, 102, 241, 0.3);
  transition: all 0.25s ease;
}

button:hover {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.35);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(79, 70, 229, 0.25);
}

button .text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

button span:last-child {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.85;
}
.result {
  margin-top: 10px;
  font-size: 13px;
  color: #374151; /* gray-700 */
}
.result strong {
  color: #dc2626; /* 红色高亮 */
}
</style>