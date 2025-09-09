<script setup lang="ts">
import { computed } from 'vue'
import type { Template } from '@/types'

const props = defineProps<{
  template: Template
  isSelected: boolean
}>()

defineEmits(['select'])

const layoutStyles = computed(() => {
  return props.template.layout.map(item => ({
    gridColumnStart: Math.round(item.x / 100 * 12) + 1,
    gridColumnEnd: Math.round((item.x + item.width) / 100 * 12) + 1,
    gridRowStart: Math.round(item.y / 100 * 12) + 1,
    gridRowEnd: Math.round((item.y + item.height) / 100 * 12) + 1,
  }))
})
</script>

<template>
  <button
    @click="$emit('select')"
    :class="[
      'relative w-full aspect-square rounded-lg p-2 transition-all duration-200 group',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
      isSelected
        ? 'bg-primary-500 shadow-lg'
        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
    ]"
  >
    <div class="grid grid-cols-12 grid-rows-12 gap-1 w-full h-full">
      <div
        v-for="(style, index) in layoutStyles"
        :key="index"
        :style="style"
        :class="[
          'rounded-sm',
          isSelected ? 'bg-white/50' : 'bg-gray-400 dark:bg-gray-500 group-hover:bg-gray-500 dark:group-hover:bg-gray-400'
        ]"
      ></div>
    </div>
  </button>
</template>

<style scoped>
.template-item {
  @apply relative p-3 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary-300 hover:shadow-sm;
}

.template-item.selected {
  @apply border-primary-500 bg-primary-50 shadow-md;
}

.template-item:hover {
  transform: translateY(-1px);
}
</style>