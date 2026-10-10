<script setup lang="ts">
/**
 * The console renders caller-owned projections and never acquires credentials,
 * probes a network, or executes a control decision.
 */
import { computed, useId } from 'vue'
import type {
  OperationsConsoleLabels,
  OperationsDocuments,
  OperationsLocale
} from '../../core'
import { useOperationsConsole } from '../composables/useOperationsConsole'
import CredentialReadinessTable from './CredentialReadinessTable.vue'
import ControlCoveragePanel from './ControlCoveragePanel.vue'
import NetworkControlsTable from './NetworkControlsTable.vue'
import NetworkObservationsTable from './NetworkObservationsTable.vue'
import StatusPill from './StatusPill.vue'
import SummaryCards from './SummaryCards.vue'

const props = withDefaults(defineProps<{
  credentialReadiness: unknown
  networkObservations: unknown
  networkControls: unknown
  controlCoverage?: unknown
  locale?: OperationsLocale
  labels?: Partial<OperationsConsoleLabels>
}>(), {
  locale: 'ja',
  labels: () => ({})
})
const source = computed<OperationsDocuments>(() => ({
  credentialReadiness: props.credentialReadiness,
  networkObservations: props.networkObservations,
  networkControls: props.networkControls
}))
const locale = computed(() => props.locale)
const overrides = computed(() => props.labels)
const consoleState = useOperationsConsole(source, locale, overrides)
const titleId = useId()
</script>

<template>
  <main class="njo-console" :aria-labelledby="titleId">
    <header class="njo-header">
      <div>
        <p class="njo-kicker">READ-ONLY OPERATIONS PROJECTION</p>
        <h1 :id="titleId">{{ consoleState.labels.value.heading }}</h1>
        <p>{{ consoleState.labels.value.description }}</p>
      </div>
      <StatusPill
        v-if="consoleState.summary.value"
        :status="consoleState.summary.value.overallStatus"
        :locale="locale"
      />
    </header>
    <div
      v-if="!consoleState.validation.value.valid"
      class="njo-alert"
      role="alert"
    >
      <strong>{{ consoleState.labels.value.invalid }}</strong>
      <ul>
        <li v-for="name in consoleState.invalidDocuments.value" :key="name">{{ name }}</li>
      </ul>
    </div>
    <template v-else-if="consoleState.documents.value && consoleState.summary.value">
      <SummaryCards
        :summary="consoleState.summary.value"
        :labels="consoleState.labels.value"
      />
      <CredentialReadinessTable
        :items="consoleState.documents.value.credentialReadiness.credentials"
        :labels="consoleState.labels.value"
        :locale="locale"
        :now="consoleState.now.value"
      />
      <NetworkObservationsTable
        :items="consoleState.documents.value.networkObservations.observations"
        :labels="consoleState.labels.value"
        :locale="locale"
        :now="consoleState.now.value"
      />
      <NetworkControlsTable
        :decisions="consoleState.documents.value.networkControls.decisions"
        :receipts="consoleState.documents.value.networkControls.receipts"
        :labels="consoleState.labels.value"
        :locale="locale"
        :now="consoleState.now.value"
      />
      <ControlCoveragePanel
        v-if="controlCoverage !== undefined"
        :document="controlCoverage"
        :locale="locale"
      />
    </template>
  </main>
</template>
