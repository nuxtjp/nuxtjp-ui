<script setup lang="ts">
import { computed } from 'vue'
import {
  isFreshProjection,
  isNetworkTopologyDocument,
  type NetworkTopologyDocument,
  type OperationsLocale
} from '../../core'
import { immutableSnapshot } from '../../core/snapshot'
import { useReactiveNow } from '../composables/useReactiveNow'
import NetworkTopologyCanvas from './NetworkTopologyCanvas.vue'

const props = withDefaults(defineProps<{
  document: unknown
  locale?: OperationsLocale
}>(), { locale: 'ja' })
const document = computed<NetworkTopologyDocument | undefined>(() =>
  isNetworkTopologyDocument(props.document)
    ? immutableSnapshot(props.document)
    : undefined
)
const now = useReactiveNow()
const stale = computed(() =>
  document.value && !isFreshProjection(document.value.generated_at, now.value)
)
const text = computed(() => props.locale === 'ja'
  ? {
      invalid: 'トポロジー投影を検証できません。',
      stale: 'トポロジー投影の有効期限が切れています。',
      title: 'ネットワーク・隔離トポロジー',
      description: '線は観測関係です。到達性や署名済み証拠を自動的には意味しません。',
      live: 'ローカル観測', declared: '宣言値', disconnected: '未接続',
      nodes: 'ノード', unknown: '要確認'
    }
  : {
      invalid: 'The topology projection could not be validated.',
      stale: 'The topology projection is stale.',
      title: 'Network and isolation topology',
      description: 'Lines show observation, not reachability or signed evidence.',
      live: 'Local observation', declared: 'Declared', disconnected: 'Not connected',
      nodes: 'Nodes', unknown: 'Attention'
    })
</script>

<template>
  <section class="njo-topology-panel">
    <p v-if="!document" class="njo-alert" role="alert">{{ text.invalid }}</p>
    <template v-else>
      <p v-if="stale" class="njo-alert" role="status">{{ text.stale }}</p>
      <header class="njo-topology-header">
        <div>
          <p class="njo-topology-eyebrow">CROWSI / METADATA ONLY</p>
          <h2>{{ text.title }}</h2>
          <p>{{ text.description }}</p>
        </div>
        <dl class="njo-topology-summary">
          <div><dt>{{ text.nodes }}</dt><dd>{{ document.summary.node_count }}</dd></div>
          <div><dt>{{ text.unknown }}</dt><dd>{{ document.summary.unknown_count }}</dd></div>
        </dl>
      </header>
      <NetworkTopologyCanvas :document="document" :locale="locale" />
      <footer class="njo-topology-legend">
        <span><i class="is-live" />{{ text.live }}</span>
        <span><i class="is-declared" />{{ text.declared }}</span>
        <span><i class="is-disconnected" />{{ text.disconnected }}</span>
      </footer>
    </template>
  </section>
</template>
