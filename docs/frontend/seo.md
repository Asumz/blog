---
head:
  - - meta
    - name: description
      content: 现代前端 SEO 实践：抓取、索引、规范化、JavaScript 渲染、结构化数据与 Core Web Vitals。
---

# 现代前端 SEO：从可抓取到可索引

## 先区分抓取、索引和规范化

前端 SEO 不是给页面塞更多关键词，而是让搜索引擎能够稳定理解三个问题：

| 问题         | 页面需要提供的信号                                  | 常见错误                      |
| ------------ | --------------------------------------------------- | ----------------------------- |
| 能否抓取     | 可访问的 URL、正常响应、可抓取链接、robots.txt      | 用 robots.txt 阻止索引        |
| 能否索引     | 有价值的正文、正确状态码、robots meta               | 错误页返回 200，形成 soft 404 |
| 哪个是主版本 | 重定向、`rel="canonical"`、一致的内部链接和 Sitemap | 多种 URL 信号互相冲突         |

`robots.txt` 控制的是爬虫能否请求资源，不等于禁止 URL 出现在搜索结果中。需要阻止索引时，应允许爬虫访问页面并返回 `noindex`，或者通过登录鉴权限制访问。参见 [Google 抓取与索引文档](https://developers.google.com/search/docs/crawling-indexing)。

## 页面标题和摘要，而不是 TDK

页面最重要的基础元数据仍然是 `title` 和 `description`：

```html
<title>二手车价格与在售车型 | Example</title>
<meta name="description" content="查看在售二手车的价格、里程、车况和门店信息。" />
```

`title` 应准确描述当前页面，并在站内保持可区分。搜索结果没有固定的 55 或 60 字符硬限制，标题会根据设备宽度按需截断，搜索引擎也可能结合页面主标题等信号重新生成展示标题。参见 [标题链接最佳实践](https://developers.google.com/search/docs/appearance/title-link)。

`description` 用于概括页面，有机会成为搜索结果摘要，但不保证原样展示；搜索引擎也可能根据查询词从正文生成更相关的片段。它同样没有固定长度上限，重点是准确、具体且每页不同，而不是堆积排名关键词。参见 [搜索摘要说明](https://developers.google.com/search/docs/appearance/snippet)。

`meta keywords` 不应再作为优化重点。Google 明确表示它对抓取、索引和排名都没有作用；其他搜索引擎的支持情况并不统一，除非目标平台明确要求，否则没有必要维护“每页若干关键词”的清单。页面主题应该通过真实正文、标题、链接上下文和结构化数据表达。参见 [Google 支持的 meta 标签](https://developers.google.com/search/docs/crawling-indexing/special-tags)。

## 用 HTTP 状态表达资源状态

页面内容和 HTTP 状态需要表达同一件事：

- 正常页面返回 `200`。
- 永久迁移使用 `301` 或 `308`。
- 资源不存在返回 `404`。
- 资源永久删除且不会恢复时可以返回 `410`。
- 登录后才能访问的资源返回适当的鉴权状态，并避免输出可索引的私有内容。

SPA 最常见的问题是所有地址都返回同一份 `200` 模板。即使页面最终显示“未找到”，搜索引擎仍可能把它识别为 soft 404。公开详情页需要索引时，应让服务端或边缘层返回真实状态。

## JavaScript 能被渲染，但不应成为唯一保障

“爬虫完全不能执行 JavaScript”已经不准确。Google 使用 Chromium 渲染 JavaScript 页面，流程包括抓取、渲染和索引；但渲染可能排队，受阻的脚本和接口也会导致正文缺失，其他爬虫未必具备同样能力。参见 [JavaScript SEO 基础](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)。

因此，SSR 和 SSG 不是排名捷径，而是提高可发现性和一致性的工程手段：

- 需要索引的标题、正文、链接和结构化数据尽量出现在初始 HTML。
- 服务端与客户端输出相同的 canonical、robots 和语言信息。
- 登录、支付、个人中心等无索引价值的页面可以继续使用 CSR。
- 不要针对爬虫返回与用户不同的内容；动态渲染只适合作为临时兼容方案。

## 规范化重复 URL

筛选参数、追踪参数、末尾斜杠、HTTP/HTTPS 和 www/非 www 都可能让同一内容产生多个地址。为重复或高度相似的页面指定一个主版本：

```html
<link rel="canonical" href="https://www.example.com/article" />
```

canonical 是信号，不是强制指令。实现时应保持一致：

- 站内链接直接指向 canonical URL。
- Sitemap 只列出 canonical URL。
- canonical 页面也添加指向自身的 canonical。
- 已废弃地址使用永久重定向，不要只依赖 canonical。
- 不要让 HTML、Sitemap 和重定向分别声明不同主版本。

参见 [规范化重复 URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)。

## robots.txt 与 robots meta 各司其职

`robots.txt` 适合减少无价值路径和资源的抓取：

```text
User-agent: *
Disallow: /internal/

Sitemap: https://www.example.com/sitemap.xml
```

页面级索引规则使用 robots meta：

```html
<meta name="robots" content="noindex, follow" />
```

非 HTML 文件可以通过响应头设置：

```http
X-Robots-Tag: noindex
```

不要同时在 robots.txt 中禁止抓取页面，又期待爬虫读取页面内的 `noindex`；爬虫无法访问页面时，也就看不到这条规则。参见 [robots meta 与 X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)。

## Sitemap 只提供真实、可索引的 URL

Sitemap 用于帮助搜索引擎发现新增或更新的页面，不保证收录，也不能替代内部链接：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.example.com/article</loc>
    <lastmod>2026-08-06</lastmod>
  </url>
</urlset>
```

`lastmod` 只有在持续准确时才有价值。Google 会忽略 `priority` 和 `changefreq`，因此没有必要生成主观优先级或猜测更新频率。大型站点需要拆分 Sitemap 时，再使用 Sitemap index。参见 [创建和提交 Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)。

## 链接要能被发现，也要表达关系

可抓取链接应使用真实的 `<a href>`，不要只绑定点击事件。站内链接使用能描述目标内容的锚文本，并尽量指向 canonical URL。

普通外链不需要统一添加 `nofollow`。只有存在特定关系时才标记：

```html
<a href="https://partner.example.com" rel="sponsored">合作伙伴</a>
<a href="https://example.com/comment" rel="ugc">用户评论链接</a>
<a href="https://unknown.example.com" rel="nofollow">不希望关联的页面</a>
```

`nofollow` 是关系提示，不等于目标页面绝不会被发现或索引。`external` 也不等同于 `target="_blank"`；是否打开新窗口属于浏览器交互行为，与 SEO 关系标记是两个问题。参见 [外链关系说明](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)。

## 语义化帮助理解，不存在标签“权重表”

标题标签应该形成清晰层级，但没有必要把 `h1`、`h2`、`strong` 和 `em` 理解为固定的排名权重：

- 每页使用一个能概括主题的主标题。
- 按内容关系组织 `h2`、`h3`，不要为了字号跳级。
- 使用 `main`、`nav`、`article` 等元素表达结构。
- 图片使用标准 `img` 或 `picture`，提供描述内容的 `alt`。
- 装饰图片使用空 `alt`，不要堆砌关键词。

语义化首先改善可访问性和页面结构，也能给搜索引擎更清楚的内容上下文。图片实践参见 [Google 图片 SEO](https://developers.google.com/search/docs/appearance/google-images)。

## 结构化数据与社交分享

结构化数据使用 Schema.org 词汇明确描述页面实体，并可能使页面获得富媒体搜索结果：

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "现代前端 SEO",
    "datePublished": "2026-08-06"
  }
</script>
```

JSON-LD 必须与页面可见内容一致，并通过 Rich Results Test 验证。正确的语法不保证一定展示富媒体结果。参见 [结构化数据入门](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)。

Open Graph 主要控制社交平台的分享预览，不应与搜索排名元数据混为一谈：

```html
<meta property="og:title" content="现代前端 SEO" />
<meta property="og:description" content="从抓取到索引的前端实践" />
<meta property="og:image" content="https://www.example.com/seo-cover.jpg" />
<meta property="og:url" content="https://www.example.com/seo" />
<meta property="og:type" content="article" />
```

`og:image` 也可能成为搜索结果或 Discover 的候选预览图，但 Open Graph 的主要职责仍是分享展示。协议定义参见 [The Open Graph protocol](https://ogp.me/)。

## 性能优化要看真实用户指标

“页面越快排名越高”过于简单。性能首先影响用户体验，Core Web Vitals 也是页面体验信号的一部分。当前三个核心指标是：

- LCP：加载性能，良好阈值为 2.5 秒以内。
- INP：交互响应，良好阈值为 200 毫秒以内。
- CLS：视觉稳定性，良好阈值为 0.1 以内。

这些指标应结合真实用户数据观察，不能用单次 Lighthouse 分数代替。内容相关性和可索引性也不会因为性能优秀而自动获得。参见 [Core Web Vitals 与搜索结果](https://developers.google.com/search/docs/appearance/core-web-vitals)。

## 上线后用工具验证

SEO 不能只靠检查源码完成。上线后至少验证：

1. URL Inspection 中抓取到的 HTML 是否包含正文、标题、canonical 和 robots。
2. 正常页、重定向和错误页是否返回正确 HTTP 状态。
3. Search Console 选择的 canonical 是否符合预期。
4. Sitemap 是否只包含可索引的 canonical URL，`lastmod` 是否真实。
5. Rich Results Test 是否能解析结构化数据。
6. Core Web Vitals 报告是否出现模板级问题。

手动提交 URL 只适合少量重要页面的临时检查。站点级发现仍应依靠可抓取的内部链接、准确的 Sitemap 和稳定的响应。

## 参考资料

- [Google Search：面向开发者的 SEO 指南](https://developers.google.com/search/docs/fundamentals/get-started-developers)
- [Google Search：JavaScript SEO 基础](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search：抓取与索引](https://developers.google.com/search/docs/crawling-indexing)
- [Google Search：搜索结果外观与结构化数据](https://developers.google.com/search/docs/appearance)
- [The Open Graph protocol](https://ogp.me/)
