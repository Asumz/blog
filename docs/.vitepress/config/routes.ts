import { type DefaultTheme } from 'vitepress'

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '随笔',
      activeMatch: '/notes/',
      link: '/notes/dev-snacks',
    },
  ]
}

function sidebarItems(): DefaultTheme.SidebarItem[] {
  return [
    { text: '🍪 开发零食铺', link: 'dev-snacks' },
    {
      text: '📝 项目随笔',
      collapsed: false,
      items: [
        { text: '大风车pc 跨应用弹窗', link: 'dfc-cross-app-modal' },
        { text: '大风车app 灰度迁移', link: 'dfc-app-gray-migration' },
        { text: '大风车h5 分享活动', link: 'dfc-h5-share-activity' },
      ],
    },
    {
      text: '🌐 前端随笔',
      collapsed: false,
      base: '/notes/frontend/',
      items: [
        { text: 'http 缓存', link: 'http-cache' },
        { text: '学习 seo', link: 'seo' },
        { text: '了解 jsBridge', link: 'js-bridge' },
        { text: '加载 svg', link: 'load-svg' },
        { text: '实现一个 bind 函数', link: 'bind-polyfill' },
        { text: '实现一个 cloneDeep 函数', link: 'clone-deep' },
      ],
    },
  ]
}

export const routes: DefaultTheme.Config = {
  nav: nav(),
  sidebar: {
    '/notes/': { base: '/notes/', items: sidebarItems() },
  },
}
