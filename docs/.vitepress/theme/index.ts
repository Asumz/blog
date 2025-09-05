import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Layout from './Layout.vue'

export default {
    extends: DefaultTheme,
    Layout: Layout,
    // 参数中的app是项目Vue3 App实例
    // router是路由实例
    // siteData是当前站点的元数据
    enhanceApp({ app, router, siteData }) {
        // 注册自定义全局组件
        // app.component('MyGlobalComponent' /* ... */)
        // 默认主题中设置了全局组件Badage，如需使用可以执行默认主题中的该方法
        // DefaultTheme.enhanceApp({ app, router, siteData })
    }
} satisfies Theme
