import { defineConfig } from 'vitepress'
import { search as zhSearch } from './zh'

export const shared = defineConfig({
    lastUpdated: true,
    cleanUrls: true,
    metaChunk: true,

    // sitemap.xml
    // sitemap: {
    //     hostname: 'https://asumz.pages.dev',
    //     transformItems(items) {
    //         return items.filter(item => !item.url.includes('migration'))
    //     }
    // },

    /* prettier-ignore */
    head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon-precomposed', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh' }],
    ['meta', { property: 'og:site_name', content: 'FX\'s Blog' }],
    ['meta', { property: 'og:title', content: 'FX\'s Blog - Personal Blog' }],
    ['meta', { property: 'og:description', content: 'Jot down the stuff worth sharing' }],
    ['meta', { property: 'og:image', content: 'https://asumz.pages.dev/fx-og.svg' }],
    ['meta', { property: 'og:url', content: 'https://asumz.pages.dev/' }],
  ],

    themeConfig: {
        logo: { src: '/favicon.svg', width: 24, height: 24 },
        externalLinkIcon: true,

        socialLinks: [
            { icon: 'github', link: 'https://github.com/Asumz' }
        ],

        footer: {
            message: 'Powered by VitePress'
        },

        search: {
            provider: 'local',
            options: {
                locales: { ...zhSearch }
            }
        }
    }
})
