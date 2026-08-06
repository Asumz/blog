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
        prev: false,
        next: false,
      },

      socialLinks: [{ icon: 'github', link: 'https://github.com/Asumz/blog' }],

      nav: routes.nav,
      sidebar: routes.sidebar,
    },
  }),
)
