import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { search as zhSearch, zh } from './zh'
import { routes } from './routes'

export default withMermaid(
  defineConfig({
  lang: 'zh-CN',
  title: '项目随笔',
  description: 'Jot down the stuff worth sharing',

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  /* prettier-ignore */
  head: [
        ['link', {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'}],
        ['link', {rel: 'apple-touch-icon', href: '/vitepress-logo-mini.png'}],
        ['meta', {name: 'theme-color', content: '#5f67ee'}],
        ['meta', {property: 'og:type', content: 'website'}],
        ['meta', {property: 'og:locale', content: 'zh'}],
        ['meta', {property: 'og:site_name', content: '项目随笔'}],
        ['meta', {property: 'og:title', content: '项目随笔 - 在报错和灵感间反复横跳'}],
        ['meta', {property: 'og:description', content: 'Jot down the stuff worth sharing'}],
        ['meta', {property: 'og:image', content: 'https://asumz.pages.dev/hero-light.svg'}],
        ['meta', {property: 'og:url', content: 'https://asumz.pages.dev/'}],
    ],

  themeConfig: {
    logo: { src: '/favicon.svg', width: 24, height: 24 },
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
