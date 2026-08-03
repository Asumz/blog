import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { search as zhSearch, zh } from './zh'
import { routes } from './routes'

export default withMermaid(
  defineConfig({
    lang: 'zh-CN',
    title: '随笔',
    description: '好记性不如烂笔头',

    lastUpdated: true,
    cleanUrls: true,
    metaChunk: true,

    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
      ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ],

    themeConfig: {
      logo: { src: '/logo.svg', width: 24, height: 24 },
      externalLinkIcon: true,

      socialLinks: [{ icon: 'github', link: 'https://github.com/Asumz' }],

      footer: {
        message: 'Powered by VitePress',
      },

      search: {
        provider: 'local',
        options: {
          locales: { ...zhSearch },
        },
      },

      nav: routes.nav,
      sidebar: routes.sidebar,
    },

    locales: {
      root: { label: '简体中文', ...zh },
    },
  }),
)
