export const vueConsumerFiles: Record<string, string> = {
  'index.html': '<html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>',
  'vite.config.ts': `import {defineConfig} from 'vite';import vue from '@vitejs/plugin-vue';import ui from '@nuxt/ui/vite';export default defineConfig({plugins:[vue(),ui({colorMode:false})]})`,
  'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true, skipLibCheck: true, noEmit: true, lib: ['ES2022', 'DOM'], types: ['vite/client'] }, include: ['src/**/*.ts', 'src/**/*.vue'] }),
  'src/style.css': `@import 'tailwindcss';@import '@nuxt/ui';`,
  'src/main.ts': `import {createApp} from 'vue';import {createRouter,createWebHistory} from 'vue-router';import ui from '@nuxt/ui/vue-plugin';import App from './App.vue';import './style.css';const router=createRouter({history:createWebHistory(),routes:[{path:'/:path(.*)',component:{template:'<p>Route</p>'}}]});createApp(App).use(router).use(ui).mount('#app')`,
  'src/App.vue': `<script setup lang="ts">
import {ref} from 'vue'
import UApp from '@nuxt/ui/components/App.vue'
import {NuxtJpDataTable,NuxtJpSeriesChart} from '@nuxtjp/ui/vue'
import type {NuxtJpDataTableRow,NuxtJpSeriesPoint,NuxtJpSeriesKind} from '@nuxtjp/ui/core'
const rows=ref<NuxtJpDataTableRow[]>([{id:'stable-a',values:{id:'data-a',constructor:'safe-value'},action:{label:'Open',to:'/stable-a'}}])
const points=ref<NuxtJpSeriesPoint[]>([{id:'2026-10',label:'2026-10',value:2}]);const kind=ref<NuxtJpSeriesKind>('bar')
function update(){rows.value.push({id:'stable-b',values:{id:'data-b',constructor:'second'}});points.value=[{id:'2026-10',label:'2026-10',value:3}];kind.value='line'}
</script>
<template><UApp><h1>Vue archive consumer</h1><NuxtJpDataTable :interactive="false" :columns="[{key:'id',label:'Data ID'},{key:'constructor',label:'Constructor'}]" :rows="rows"/><NuxtJpSeriesChart label="Series" :points="points" :kind="kind"/><button @click="update">Update</button></UApp></template>`,
  'view.spec.ts': `import {test,expect} from '@playwright/test';test('actual packed Vue table and chart',async({page})=>{
const external:string[]=[];await page.route('**/*',route=>{if(new URL(route.request().url()).hostname!=='127.0.0.1'){external.push(route.request().url());return route.abort()}return route.continue()});
await page.goto('/');await expect(page.getByRole('heading',{name:'Vue archive consumer'})).toBeVisible();await expect(page.getByRole('cell',{name:'data-a',exact:true})).toBeVisible();await expect(page.getByRole('cell',{name:'safe-value',exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'Open',exact:true})).toHaveAttribute('href','/stable-a');await expect(page.getByRole('textbox')).toHaveCount(0);await expect(page.getByRole('img',{name:'Series',exact:true})).toBeVisible();await expect(page.getByText('2026-10: 2',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Update',exact:true}).click();await expect(page.getByRole('cell',{name:'data-b',exact:true})).toBeVisible();await expect(page.getByText('2026-10: 3',{exact:true})).toBeVisible();await expect(page.getByRole('alert')).toHaveCount(0);expect(external).toEqual([])
})`,
}
