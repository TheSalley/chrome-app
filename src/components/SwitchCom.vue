<template>
  <label class="toggle" :class="{ 'is-on': props.status, 'is-disabled': props.disabled }">
    <input
      type="checkbox"
      role="switch"
      :checked="props.status"
      :disabled="props.disabled"
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
  disabled: { type: Boolean, default: false },
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
  width: 46px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: #e9e9ea;
  transition: background-color 200ms var(--ease-apple), opacity 200ms var(--ease-apple);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04);
  transition: transform 250ms cubic-bezier(0.28, 0.6, 0.2, 1);
}

.toggle:active:not(.is-disabled) .toggle-thumb {
  transform: scale(0.92);
}

.toggle.is-on .toggle-track {
  background: #34c759;
}

@media (prefers-color-scheme: dark) {
  .toggle-track { background: rgba(120,120,128,0.32); }
  .toggle.is-on .toggle-track { background: #30d158; }
}

.toggle.is-on .toggle-thumb {
  transform: translateX(18px);
}

.toggle.is-on:active:not(.is-disabled) .toggle-thumb {
  transform: translateX(18px) scale(0.92);
}

.toggle.is-disabled {
  cursor: not-allowed;
}

.toggle.is-disabled .toggle-track {
  filter: grayscale(1) opacity(0.6);
}
</style>
