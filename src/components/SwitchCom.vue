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
  width: 51px;
  height: 31px;
  border: 0;
  border-radius: 999px;
  background: var(--color-system-gray);
  transition: background-color 200ms var(--ease-apple), opacity 200ms var(--ease-apple);
}

.toggle:hover:not(.is-disabled) .toggle-track {
  opacity: 0.85;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: var(--color-system-raised);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  transition: transform 200ms var(--ease-apple);
}

.toggle:active:not(.is-disabled) .toggle-thumb {
  transform: scale(0.92);
}

.toggle.is-on .toggle-track {
  background: var(--color-system-green);
}

.toggle.is-on .toggle-thumb {
  transform: translateX(20px);
}

.toggle.is-on:active:not(.is-disabled) .toggle-thumb {
  transform: translateX(20px) scale(0.92);
}

.toggle.is-disabled {
  cursor: not-allowed;
}

.toggle.is-disabled .toggle-track {
  filter: grayscale(1) opacity(0.6);
}
</style>
