# HugeAuto SEO 工程化：从 TDK 到结构化数据

## 我接手的不是一套现成的 SEO 工程

开始建设 HugeAuto 官网 SEO 时，项目还没有一套可以复用和验证的 SEO 工程。部分页面存在零散的 title 或 meta，但多语言 TDK、canonical、hreflang、社交分享、结构化数据、HTTP 状态码和 robots 之间没有统一规则，也没有明确的维护入口。

这意味着我的工作不是在已有方案上补几个标签，而是从 0 到 1 建立整套 SEO 能力：先定义可索引页面需要提供哪些信息，再设计路由、i18n、SSR、Head 和 HTTP 响应之间如何协作，最后把规则沉淀为页面可以直接使用的 Hook 与工程约束。

真正困难的也不是某一个 meta 标签怎么写，而是如何让规则在路由调整、语言扩展和动态详情页中持续成立。路由改名后 TDK 不能静默失效；新增阿拉伯语后 hreflang 必须自动扩展；结构化数据也不能分别散落在插件、布局和页面里。

所以我没有选择逐页堆叠标签，而是从一个问题开始设计：**一个可索引页面，最少需要提供哪些事实，剩下的能不能由统一工具生成？**

## 第一步是给页面确定身份

最后我选择用 route name 作为页面的 SEO 身份：

```text
tdk.<routeName>.title
tdk.<routeName>.description
tdk.<routeName>.keywords
```

例如路由叫 `UsedCar`，四套 `tdk.json` 都必须存在 `tdk.UsedCar`。页面只提供动态变量，品牌后缀由全局 titleTemplate 统一拼接。

这个规则有些严格：路由 name 一旦变化，语言资源必须同步。可它也把原本隐性的关系变成了可检查的约定。新增页面时，不再需要到处寻找“这个 title 到底写在哪”。

静态页只需调用：

```js
usePageSeo()
```

动态页则提供 getter：

```js
const seoVars = () => ({
  modelName: detail.modelName || '',
  modelYear: detail.modelYear || '',
})

usePageSeo({ vars: seoVars })
```

我使用 getter 而不是 setup 时生成一次普通对象，因为接口数据回来后，head 也需要跟着更新。

`usePageSeo` 只消费页面已经取得的详情数据，不额外发起一套 SEO 请求。首屏取数、状态注水和请求复用属于 SSR 数据层的职责，SEO Hook 不重复处理。

## canonical 被查询参数搞复杂了

详情页有两种 URL 形式。一种把资源标识放在 path 中，另一种仍然通过 query 区分资源，例如：

```text
/car-news-details?id=1001&utm_source=share&page=2
```

最初如果直接复制当前 query，canonical 会带上分享来源、分页和临时筛选条件。同一篇新闻可能因此出现很多“权威地址”。

我没有维护一份需要删除的参数黑名单，而是让页面声明真正用于识别内容的白名单：

```js
usePageSeo({ queryKeys: ['id'] })
```

最终 canonical 只保留 `id`。同一套白名单也用于生成其他语言的 alternate URL。

这个选择看起来只是少写几个参数，实际上是在明确页面身份：如果去掉某个 query 后内容没有变化，它通常就不应该出现在 canonical 中。

## 多语言 URL 不再由页面手写

有了 route name、params 和必要 query 后，`usePageSeo` 可以让 Router 重新解析每一种语言的地址：

```html
<link rel="canonical" href="https://example.com/fr/used-cars" />
<link rel="alternate" hreflang="x-default" href="https://example.com/used-cars" />
<link rel="alternate" hreflang="en" href="https://example.com/used-cars" />
<link rel="alternate" hreflang="zh" href="https://example.com/zh/used-cars" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/used-cars" />
<link rel="alternate" hreflang="ar" href="https://example.com/ar/used-cars" />
```

英文默认不带前缀，`x-default` 也指向英文页面。这里最重要的不是少写几行 HTML，而是 hreflang 开始和真实路由使用同一份语言列表与参数规则。

## 结构化数据一度比 meta 更难维护

结构化数据最初分散在多个位置：站点插件负责 Organization，布局负责面包屑，详情页再添加 Car 或 Article。每一段单独看都合理，合在一起却可能出现重复节点、不同的站点信息和多个互不关联的 JSON-LD。

我最后做的决定是：全站只允许 `usePageSeo` 输出一个 schema.org `@graph`。

```mermaid
flowchart LR
  Org["Organization"] --> Site["WebSite"]
  Site --> Page["WebPage"]
  Page --> Breadcrumb["BreadcrumbList"]
  Page --> Extra["Car / Article / FAQPage / ItemList"]
```

基础节点由 Hook 生成，页面只贡献业务节点：

```js
usePageSeo({
  schema: () => ({
    breadcrumb: breadcrumbList.value,
    article: buildArticle(detail),
  }),
})
```

各节点通过 `@id` 互相引用。可见面包屑和 BreadcrumbList 使用同一份配置，避免页面展示 `Home > News > Detail`，结构化数据却只有 `Home > Detail`。

这次收口也让我明确了一条边界：通用 Hook 负责图谱关系，Car、Article、FAQPage 等字段整理留在业务 helper 中。否则一个 SEO Hook 很快会变成所有页面数据清洗逻辑的集合。

## 最让我改变方案的是软 404

项目曾经把失效详情页 301 到一个错误展示页。用户看到的结果似乎没问题，但搜索引擎收到的语义非常奇怪：原 URL 被永久迁移，目标页却没有对应资源。

后来我把“用户看到什么”和“HTTP 响应是什么”分开处理：

| 资源状态                   | 最终选择 |
| -------------------------- | -------- |
| URL 根本不存在             | 404      |
| 数据暂时缺失、未来可能恢复 | 404      |
| 商品确定永久删除           | 410      |
| 老 URL 有明确的新地址      | 301      |
| 临时跳转                   | 302      |

服务端仍然可以渲染完整的错误说明页，但响应状态必须准确。尤其是 410，它不是“更严重的 404”，而是在明确告诉爬虫这个资源不会回来。

为了避免页面直接操作底层 SSR context，我把错误状态和重定向分别封装成 `useSSRError` 与 `useSSRRedirect`。CSR 下它们不做任何事，页面可以在服务端预取逻辑中直接表达资源语义。

## noindex 和 robots 也应该进入同一套规则

登录、支付和个人中心页面没有索引价值。它们通过 route meta 声明 `noindex`，应用统一输出 `noindex, nofollow`，SEO Hook 同时停止生成 canonical、hreflang 和 JSON-LD。

环境层面则在构建后生成不同的 `robots.txt`：测试和 UAT 全站禁止抓取，生产环境才开放公开页面并声明 sitemap。

我不想依靠“上线前记得改一下 robots”这种流程。能由构建环境确定的事情，就不应该继续交给人工记忆。

## 从 0 到 1 建完这套 SEO 工程后

完成这套从路由身份、多语言 TDK 到结构化数据和 HTTP 语义的建设后，我不再把 SEO 看成页面开发结束后的标签补丁。

对动态多语言网站来说，SEO 更接近一份页面协议：路由定义身份，i18n 提供内容，SSR 保证首屏事实完整，Hook 生成 canonical、alternate、分享信息和结构化图谱，HTTP 状态码表达资源是否存在。

统一出口并没有消灭复杂度，它只是让复杂度有了边界。页面开发者仍然要判断哪些 query 真正标识内容、哪些日期可信、资源消失后应该返回什么状态；但不再需要每个人重新拼一遍 head 标签。
