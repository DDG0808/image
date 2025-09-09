<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import TemplateSelector from '@/components/TemplateSelector/TemplateSelector.vue'
import ParameterPanel from '@/components/ParameterPanel/ParameterPanel.vue'
import Canvas from '@/components/Canvas/Canvas.vue'
</script>

<template>
  <AppLayout>
    <template #main>
      <Canvas />
    </template>
    <template #templates>
      <TemplateSelector />
    </template>
    <template #parameters>
      <ParameterPanel />
    </template>
  </AppLayout>
</template>
