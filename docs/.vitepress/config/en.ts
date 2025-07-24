// import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

// const require = createRequire(import.meta.url)

export const en = defineConfig({
    lang: 'en-US',
    title: "FX's Personal Website",
    description: 'Jot down the stuff worth sharing',

    themeConfig: {
        nav: nav(),
    },
})

function nav(): DefaultTheme.NavItem[] {
    return [
        {
            text: 'Web Technology',
            link: '/en/',
            activeMatch: '/en/',
        },
        {
            text: 'e.g.',
            link: '/en/',
            activeMatch: '/en/',
        },
    ]
}
