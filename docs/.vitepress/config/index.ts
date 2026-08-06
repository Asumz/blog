import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { routes } from './routes'

export default withMermaid(
  defineConfig({
    lang: 'zh-CN',
    title: '随笔',

    lastUpdated: false,
    cleanUrls: true,
    metaChunk: true,

    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
      ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
      ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ],

    themeConfig: {
      logo: { src: '/logo.svg', width: 24, height: 24 },
      externalLinkIcon: true,

      docFooter: {
        prev: '上一页',
        next: '下一页',
      },

      outline: {
        label: '页面导航',
      },

      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '菜单',
      darkModeSwitchLabel: '主题',
      lightModeSwitchTitle: '切换到浅色模式',
      darkModeSwitchTitle: '切换到深色模式',

      socialLinks: [{ icon: 'github', link: 'https://github.com/Asumz/blog' }],

      search: {
        provider: 'local',
        options: {
          translations: {
            button: {
              buttonText: '搜索文档',
            },
            modal: {
              displayDetails: '显示详情',
              noResultsText: '未找到相关结果',
              resetButtonTitle: '清除',
              footer: {
                closeText: '关闭',
                selectText: '选择',
                navigateText: '切换',
              },
            },
          },
        },
      },

      nav: routes.nav,
      sidebar: routes.sidebar,
    },
  }),
)
