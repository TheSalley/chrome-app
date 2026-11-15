<template>
  <label class="toggle" :class="{ 'is-on': props.status }">
    <input
      type="checkbox"
      role="switch"
      :checked="props.status"
      :aria-checked="props.status"
      aria-label="切换功能状态"
      @change="onChange($event)"
    />
    <span class="toggle-track" aria-hidden="true">
      <span class="toggle-thumb"></span>
    </span>
  </label>
</template>
<script setup>
const props = defineProps({
  status: Boolean,
});

const emits = defineEmits(["switchChange"]);

function onChange(event) {
  const checked = event.target.checked;
  emits("switchChange", checked);
}
</script>
<style scoped>
.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: none;
  cursor: pointer;
}

.toggle input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.toggle-track {
  position: relative;
  display: block;
  width: 38px;
  height: 22px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: linear-gradient(180deg, #eef2f7 0%, #e2e8f0 100%);
  box-shadow: inset 0 1px 2px rgba(23, 32, 51, 0.08);
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(23, 32, 51, 0.2), 0 1px 1px rgba(23, 32, 51, 0.08);
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.toggle.is-on .toggle-track {
  border-color: #1d4ed8;
  background: linear-gradient(180deg, #3b82f6 0%, var(--primary) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 3px 9px rgba(37, 99, 235, 0.24);
}

.toggle.is-on .toggle-thumb {
  transform: translateX(16px);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.26);
}

.toggle input:focus-visible + .toggle-track {
  outline: 2px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}
</style>
