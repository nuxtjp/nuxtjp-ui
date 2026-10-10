export default defineAppConfig({
  nuxtJpUi: { locale: 'ja' },
  nuxtJpManagementLayout: {
    brand: { name: 'NuxtJP Management Layout', shortName: 'Management', mark: 'N', home: '/' },
    routes: [
      route('overview', '概要', '運用概要', '/', 'i-lucide-layout-dashboard'),
      route('operations', '操作', '運用操作', '/operations', 'i-lucide-square-terminal'),
      route('resources', 'リソース', 'リソース一覧', '/resources', 'i-lucide-box'),
      { id: 'resource-detail', label: 'リソース詳細', title: 'リソース詳細',
        path: '/resources/:id', match: 'segments', parentId: 'resources' }
    ],
    navigation: [
      { id: 'overview', label: '全体', routeIds: ['overview'] },
      { id: 'operations', label: '運用', routeIds: ['operations', 'resources'] }
    ],
    environment: { label: 'Playground', color: 'info' },
    footer: { label: 'ローカル検証', badge: 'NuxtJP' }
  }
})

function route(id: string, label: string, title: string, path: string, icon: string) {
  return { id, label, title, path, icon }
}
