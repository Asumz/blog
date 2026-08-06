import { type DefaultTheme } from 'vitepress'

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '随笔',
      activeMatch: '/',
      link: '/',
    },
    {
      text: 'VitePress',
      link: 'https://vitepress.dev/zh',
    },
  ]
}

function siderbar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '项目随笔',
      collapsed: false,
      base: '/notes/',
      items: [
        { text: 'HugeAuto 多语言实践', link: 'hugeauto-i18n' },
        { text: 'HugeAuto SEO 工程化', link: 'hugeauto-seo' },
        { text: 'HugeAuto 部分 SSR 与数据水合', link: 'hugeauto-partial-ssr' },
        { text: 'HugeAuto 统一收银台', link: 'hugeauto-checkout' },
        { text: '大风车 无界弹窗方案', link: 'dfc-wujie-modal' },
        { text: '大风车 RN 灰度迁移到 H5', link: 'dfc-rn-to-h5-migration' },
      ],
    },
    {
      text: '前端随笔',
      collapsed: false,
      base: '/frontend/',
      items: [
        { text: '现代前端 SEO', link: 'seo' },
      ],
    },
  ]
}

export const routes: DefaultTheme.Config = {
  nav: nav(),
  sidebar: siderbar(),
}
