<script setup lang="ts">
import { ref } from 'vue'
import type { OperationsLocale } from '../src/runtime/core'
import { documents } from './documents'

const locale = ref<OperationsLocale>('ja')
</script>

<template>
  <div>
    <label class="locale-control">
      <span>Language / 言語</span>
      <select v-model="locale">
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </label>
    <NuxtJpOperationsConsole
      :credential-readiness="documents.credentialReadiness"
      :network-observations="documents.networkObservations"
      :network-controls="documents.networkControls"
      :control-coverage="documents.controlCoverage"
      :locale="locale"
    />
    <NuxtJpNetworkTopologyPanel
      :document="documents.networkTopology"
      :locale="locale"
    />
  </div>
</template>

<style>
body {
  background: #eef2f4;
  margin: 0;
}

.locale-control {
  align-items: center;
  display: flex;
  font-family: system-ui, sans-serif;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem;
}
</style>
