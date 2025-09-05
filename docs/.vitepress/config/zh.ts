import {defineConfig, type DefaultTheme} from 'vitepress'

export const zh = defineConfig({
    themeConfig: {
        docFooter: {
            prev: '上一页',
            next: '下一页',
        },

        outline: {
            label: '页面导航',
        },

        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'medium',
            },
        },

        editLink: {
            pattern: 'https://github.com/Asumz/blog/edit/main/docs/:path',
            text: '在 GitHub 上编辑此页面',
        },

        langMenuLabel: '多语言',
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
    },
})

export const search: DefaultTheme.LocalSearchOptions['locales'] = {
    root: {
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
}
