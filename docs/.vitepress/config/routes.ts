import { type DefaultTheme } from 'vitepress'

function nav(): DefaultTheme.NavItem[] {
    return [
        {
            text: '随笔',
            activeMatch: '/examples/',
            link: '/examples/share',
        },
    ]
}

function sidebarExamples(): DefaultTheme.SidebarItem[] {
    return [
        { text: '📚 好文分享', link: 'share', },
        {
            text: '📝 项目随笔',
            collapsed: false,
            items: [
                { text: '项目构建优化', link: 'bundle-optimization' },
                { text: 'app检测与跳转方案实现', link: 'app-download' },
                { text: '绘制动态海报', link: 'draw-poster' },
                { text: '大风车PC 无界弹窗', link: 'wujie-modal' },
                { text: '大风车APP 灰度迁移', link: 'grey-projects' },
                { text: '大风车跨端 月卡活动', link: 'monthly-pass' },
            ],
        },
        {
            text: '🌐 Web',
            collapsed: false,
            base: '/examples/web/',
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
            base: '/examples/javascript/',
            items: [
                { text: '实现一个bind函数', link: 'bind-polyfill' },
                { text: '实现一个cloneDeep函数', link: 'clone-deep' },
            ],
        },
        {
            text: '🎨 CSS',
            base: '/examples/css/',
            collapsed: false,
            items: [{ text: '理解 BFC', link: 'bfc' },],
        },
    ]
}

export const routes: DefaultTheme.Config = {
    nav: nav(),
    sidebar: {
        '/examples/': { base: '/examples/', items: sidebarExamples() },
    },
}