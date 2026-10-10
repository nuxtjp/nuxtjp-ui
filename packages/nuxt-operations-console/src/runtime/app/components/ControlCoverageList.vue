<script setup lang="ts">
import {
  controlCoverageAssetState,
  controlCoverageFindingLabel,
  controlCoverageFindings,
  controlCoverageIsolationReady,
  type ControlCoverageAsset,
  type ControlCoverageLabels,
  type OperationsLocale
} from '../../core'
import StatusPill from './StatusPill.vue'

const props = defineProps<{
  items: ControlCoverageAsset[]
  generatedAt: number
  labels: ControlCoverageLabels
  locale: OperationsLocale
  now: number
}>()
const state = (item: ControlCoverageAsset) =>
  controlCoverageAssetState(item, props.generatedAt, props.now)
const ready = (item: ControlCoverageAsset) =>
  controlCoverageIsolationReady(item, props.generatedAt, props.now)
const findings = (item: ControlCoverageAsset) =>
  controlCoverageFindings(item, props.generatedAt, props.now)
</script>

<template>
  <section class="njo-coverage-list">
    <h3>{{ labels.assets }}</h3>
    <div class="njo-table-scroll" tabindex="0">
      <table>
        <thead>
          <tr>
            <th scope="col">{{ labels.status }}</th>
            <th scope="col">{{ labels.asset }}</th>
            <th scope="col">{{ labels.isolation }}</th>
            <th scope="col">{{ labels.findings }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td><StatusPill :status="state(item)" :locale="locale" /></td>
            <th scope="row"><code>{{ item.id }}</code></th>
            <td :class="{ 'njo-coverage-ready': ready(item) }">
              {{ ready(item) ? labels.verified : labels.notVerified }}
            </td>
            <td>
              <ul v-if="findings(item).length" class="njo-coverage-findings">
                <li v-for="code in findings(item)" :key="code">
                  <span>{{ controlCoverageFindingLabel(code, locale) }}</span>
                  <code>{{ code }}</code>
                </li>
              </ul>
              <span v-else>{{ labels.none }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
