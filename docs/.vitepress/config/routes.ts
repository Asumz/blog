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
        { text: '大风车PC 跨应用弹窗', link: 'dfc-cross-app-modal' },
        { text: '大风车App 灰度迁移', link: 'dfc-app-gray-migration' },
        { text: '大风车H5 分享活动', link: 'dfc-h5-share-activity' },
      ],
    },
    {
      text: '🌐 Web',
      collapsed: false,
      base: '/notes/web/',
      items: [
        { text: 'HTTP 缓存', link: 'http-cache' },
        { text: '关于 JSBridge', link: 'js-bridge' },
        { text: '加载 SVG', link: 'load-svg' },
        { text: '学习 SEO', link: 'seo' },
      ],
    },
    {
      text: '🟡 JavaScript',
      collapsed: false,
      base: '/notes/javascript/',
      items: [
        { text: '实现一个bind函数', link: 'bind-polyfill' },
        { text: '实现一个cloneDeep函数', link: 'clone-deep' },
      ],
    },
    {
      text: '🎨 CSS',
      base: '/notes/css/',
      collapsed: false,
      items: [{ text: '理解 BFC', link: 'bfc' }],
    },
  ]
}

export const routes: DefaultTheme.Config = {
  nav: nav(),
  sidebar: {
    '/notes/': { base: '/notes/', items: sidebarItems() },
  },
}
