---
head:
    - - meta
      - name: description
        content: hello
    - - meta
      - name: keywords
        content: super duper SEO
---

# SEO

SEO（搜索引擎优化）是一种用于提升网页在搜索引擎中的收录数量以及排序位置而做的优化行为。

所需的一切， 排名更高 ⭐ 并获得更多流量 ⛰️

## SEO 怎么做

SEO 是一个持续进行的过程，大致分为四个方面：

关键词研究、**页面 SEO**、**链接建设**、技术性 SEO

## 一、TDK

TDK 是 Title(标题)、Description（描述）和 Keywords（关键词）的缩写，是网站 SEO 的关键

### title

页面标题的内容可能对搜索引擎优化（SEO）具有重要意义。通常，较长的描述性标题要比简短或一般性标题更好。

```html
<title>标题</title>
```

撰写好标题的一些准则和技巧：

- 避免使用一两个单词的标题。对于词汇表或参考样式的页面，请使用描述性短语或术语 - 定义对。
- 搜索引擎通常显示页面标题的前 55 至 60 个字符。超出此范围的文本可能会丢失，因此请尽量不要使标题更长。
- 尝试确保你的标题在你自己的网站中尽可能唯一。标题重复（或几乎重复）可能会导致搜索结果不准确。

### description

一段简短而精确的、对页面内容的描述。

```html
<meta name="description" content="描述" />
```

注意：内容**不宜过短**，作为摘要信息展示的时候如果一行都显示不全，不利于吸引用户点击

### keywords

与页面内容相关的关键词，使用逗号分隔。

```html
<meta name="keywords" content="关键词" />
```

::: warning 注意
不同页面的关键词应该**尽量不重复**，避免关键词相互竞争, 关键词的数量应控制在 4-8 个，过多可能会被搜索引擎认为是关键词堆砌，影响
SEO 效果
:::

因为滥用等原因，大多数主流搜索引擎已经大幅降低了 keywords 元标签对网页排名的影响
​

::: tip 提示
对于不同页面，可设置不同的 TDK，来增加关键词的收录量
:::

## 二、OG 协议

Open Graph Protocol（开放图谱协议），简称 OG 协议。它是一种**为社交分享而生**的 Meta
标签，用于标准化网页中元数据的使用，使得社交媒体得以以丰富的“图形”对象来表示共享的页面内容。它允许在 Facebook 上，其他网站能像
Facebook 内容一样具有丰富的“图形”对象，进而促进 Facebook 和其他网站之间的集成。也有利于 SEO 优化。

常见的 OG 标签包括：

```html
<meta property="og:title" content="页面标题" />
<meta property="og:description" content="页面描述" />
<meta property="og:image" content="页面图片" />
<meta property="og:url" content="页面URL" />
<meta property="og:type" content="网页类型，如website，article" />
<meta property="og:release_date" content="定义网页内容的发布时间" />
```

在社交媒体中的表现形态，例如飞书：

![og](/img/og.png)

:::tip 提示
查看更多：[The Open Graph protocol](https://ogp.me/)
:::

## 三、HTML 语义化

HTML 语义化主要作用有以下几点：

1. 方便屏幕阅读器解析
2. 有利于 SEO，搜索引擎更容易理解语义化页面的内容结构和主题
3. 便于团队开发和维护，语义化更具有可读性

### 标题标签

相比其他标签，`h[1-6]` 标签在页面中的权重非常高，所以使用时要注意不要滥用。

### 强调标签

`strong`、`em` 强调标签权重虽比 `h` 标签低，但也比其他标签权重高

### 超链接标签

**a 标签分为“内链”和“外链”**

内链：从自己网站的一个页面指向另外一个页面。通过内链让网站内部形成网状结构，让蜘蛛的广度和深度达到最大化

外链：在别的网站导入自己网站的链接。通过外链提升网站权重，提高网站流量。

**a 标签的两个属性**

`rel=nofollow` 此属性的意思是告诉搜索引擎，不要将该链接计入权重。例如一些非本站的链接，不想传递权重

`rel="external"` 此属性的意思是告诉搜索引擎，这个链接不是本站链接，其实作用相当于 `target="_blank"` 。

`rel="external nofollow"` 大致可以解释为 “这个链接非本站链接，不要爬取也不要传递权重”。因此在 SEO
的角度来说，是一种绝对隔绝处理的方法，可以有效减少蜘蛛爬行的流失。

```html
<a rel="external nofollow" href="https://www.baidu.com/">百度</a>
```

### 图片标签

图像标签的 alt 属性有助于图像 SEO，并在网络故障时，代替图片显示

### 布局标签

`header`、`nav`、`article`、`section`、`aside`、`footer`

## 四、sitemap 站点地图

Sitemap 可方便管理员通知搜索引擎他们网站上有哪些可供抓取的网页。最简单的 Sitepmap 形式，就是 XML
文件，在其中列出网站中的网址以及关于每个网址的其他元数据（上次更新的时间、更改的频率以及相对于网站上其他网址的重要程度为何等），以便搜索引擎可以更加智能地抓取网站。

例如在根目录下新建 `sitemap.xml` 内容格式如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>http://www.example.com/</loc>
      <lastmod>2005-01-01</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>
</urlset>
```

loc：页面地址

lastmod：内容最后修改时间

changefreq：预计更新频率

priority：页面相对于其他页面优先级，它的值范围是 0.0 到 1.0，其中 1.0 表示最高优先级

:::tip 提示

如果 sitemap.xml 没有放在根目录，需在 robots.txt 中指明 Sitemap 位置，否则搜索引擎可能无法找到

查看更多 [sitemaps.org - Protocol](https://www.sitemaps.org/protocol.html)

:::

## 五、 robots 文件

Robots.txt 文件是用来告诉搜索引擎，网站上的哪些页面可以抓取，哪些页面不能抓取。

如果你的网站已经有了 robots.txt 文件，那么你可以通过 *domain.com/robots.txt*这个链接进行访问。

下面就是一个简单的 `robots.txt` 文件：

```
Sitemap: https://www.domain.com/sitemap.xml

User-agent: *
Disallow: /blog
Allow: /blog/allowed-post
```

User-agent： 针对不同的用户代理分配抓取规则，你也可以使用通配符（\*）来一次性为所有的用户代理制定规则。

Disallow：使用此指令来规定搜索引擎不要访问特定路径的文件和页面。

Allow：使用此指令来规定搜索引擎需要访问特定路径的文件和页面——即使在一个被 disallow 指令屏蔽的路径中也可以使用。

Sitemap：使用此指令来标记你网站地图所的位置。如果你对网站地图不熟悉，它通常会包含你需要被搜索引擎抓取&索引的所有页面链接。

::: tip 提示

小提示，你可以在 robots.txt 中使用多条 sitemap 指令。

查看更多：[关于 Robots.txt 和 SEO: 你所需要知道的一切](https://ahrefs.com/blog/zh/robots-txt/)

:::

## 六、各搜索引擎提交站点收录

除了 robots.txt + sitemap.xml 方式增加网址被收录的可能性外，还可以在各搜索引擎站长平台手动提交网址，以缩短爬虫发现网站链接时间，加快爬虫抓取速度

百度：[ziyuan.baidu.com/](https://link.zhihu.com/?target=https%3A//link.juejin.cn/%3Ftarget%3Dhttps%253A%252F%252Fziyuan.baidu.com%252F)

谷歌：[developers.google.com/search?hl=z…](https://link.zhihu.com/?target=https%3A//link.juejin.cn/%3Ftarget%3Dhttps%253A%252F%252Fdevelopers.google.com%252Fsearch%253Fhl%253Dzh-cn)

搜狗：[zhanzhang.sogou.com/](https://link.zhihu.com/?target=https%3A//link.juejin.cn/%3Ftarget%3Dhttps%253A%252F%252Fzhanzhang.sogou.com%252F)

360：[zhanzhang.so.com/](https://link.zhihu.com/?target=https%3A//link.juejin.cn/%3Ftarget%3Dhttps%253A%252F%252Fzhanzhang.so.com%252F)

必应：[www.bing.com/webmasters/…](https://link.zhihu.com/?target=https%3A//link.juejin.cn/%3Ftarget%3Dhttps%253A%252F%252Fwww.bing.com%252Fwebmasters%252Fabout)

## 七、SSR、SSG、ISR

爬虫只能抓取到网页的静态源代码，而无法执行其中的 JavaScript 脚本。当网站采用 Vue 或 React 构建 SPA 项目时，页面上的大部分
DOM 元素实际上是在客户端通过 JavaScript 动态生成的。这意味着爬虫能够直接抓取和分析的内容会大幅减少。

参考：[什么是 CSR、SSR、SSG、ISR - 渲染模式详解](https://zhuanlan.zhihu.com/p/640900230)

爬虫除了不会抓取 JavaScript 脚本的内容，也不会抓取 iframe 中的内容，因此项目中少用 iframe

## 八、网址规范化

例如，一个页面可能有多个 URL 地址，比如：

https://example.com/article.html

https://example.com/article

https://www.example.com/article

这些 URL 指向同一个页面内容。但是，我们应该指定其中一个作为该页面的规范化 URL

```html
<link rel="canonical" href="https://www.example.com/article" />
```

一些常见原因为

1. 为了支持多种设备类型，如 _m.example.com_, _example.com_
2. 当你将同一篇博文同时放到多个板块中，你的博客系统会自动保存多个网址，如 _/pathA/seo_，_/pathB/seo_
3. 你的服务器已配置为针对 www / 非 www，http / https 变体提供相同的内容，如 _wwww.example.com_，_example.com_。

## 九、网站性能

网站打开速度越快，识别效果越好，否则爬虫会认为该网站对用户不友好，降低爬取效率

## 参见

[Ahrefs 博客](https://ahrefs.com/blog/zh/)

[SEO 初学者指南](https://ahrefs.com/zh/seo)

[The Open Graph protocol](https://ogp.me/)

[sitemaps.org - Protocol](https://www.sitemaps.org/protocol.html)

[关于 Robots.txt 和 SEO: 你所需要知道的一切](https://ahrefs.com/blog/zh/robots-txt/)

[什么是 CSR、SSR、SSG、ISR - 渲染模式详解](https://zhuanlan.zhihu.com/p/640900230)
