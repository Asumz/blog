import { type DefaultTheme } from 'vitepress'

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '随笔',
      activeMatch: '^/$|^/notes/',
      link: '/',
    },
    {
      text: 'VitePress',
      link: 'https://vitepress.dev/zh',
    },
  ]
}

function sidebarItems(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '项目随笔',
      collapsed: false,
      base: '/notes/',
      items: [
        { text: '大风车pc 跨应用弹窗', link: 'dfc-cross-app-modal' },
        { text: '大风车app 灰度迁移', link: 'dfc-app-gray-migration' },
        { text: '大风车h5 分享活动', link: 'dfc-h5-share-activity' },
        { text: 'HugeAuto 多语言实践', link: 'hugeauto-i18n' },
        { text: 'HugeAuto SEO 工程化', link: 'hugeauto-seo' },
        { text: 'HugeAuto 部分 SSR 与数据水合', link: 'hugeauto-partial-ssr' },
        { text: 'HugeAuto 统一收银台', link: 'hugeauto-checkout' },
      ],
    },
    {
      text: '前端随笔',
      collapsed: false,
      base: '/notes/frontend/',
      items: [
        { text: 'http 缓存', link: 'http-cache' },
        { text: '了解 jsBridge', link: 'js-bridge' },
        { text: '了解 seo', link: 'seo' },
      ],
    },
  ]
}

export const routes: DefaultTheme.Config = {
  nav: nav(),
  sidebar: sidebarItems(),
}
