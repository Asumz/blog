# 加载 SVG

## 前言

SVG 作为矢量图的一种标准格式，已经得到了各大浏览器的支持，它也成为了 Web 中矢量图的代名词。 在网页中采用 SVG 代替位图有如下好处：

-   SVG 相对于位图更清晰，在任意缩放的情况下后不会破坏图形的清晰度，SVG 能方便地解决高分辨率屏幕下图像显示不清楚的问题。

-   在图形线条比较简单的情况下，SVG 文件的大小要小于位图，在扁平化 UI 流行的今天，多数情况下 SVG 会更小。

-   图形相同的 SVG 比对应的高清图有更好的渲染性能。

-   SVG 采用和 HTML 一致的 XML 语法描述，灵活性很高。

## SVG 基本使用方式

### html 中嵌入

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <text y=".9em" font-size="80">🚀</text>
</svg>
```

### CSS 背景图

```css
body {
    background-image: url(/favicon.svg);
}
```

### img 标签引入

```html
<img src="/favicon.svg" />
```

## SVG 工具

### 使用 url-loader

> url-loader 可以把文件的内容经过 base64 编码后注入到 JavaScript 或者 CSS 中去。

:::warning 注意
由于一般的图片数据量巨大， 经 base64 编码后会变得更大。 所以在使用 url-loader 时一定要注意图片体积不能太大，不然会导致 JavaScript、CSS 文件过大而带来的网页加载缓慢问题。
:::

一般把网页需要用到的小图片资源注入到代码中去，以减少 HTTP 请求次数。

例如 CSS 源码如下：

```css
body {
    background-image: url(/favicon.svg);
}
```

被 url-loader 转换后输出的 CSS 会变成这样：

```css
body {
    background-image: url(data:image/svg;base64,iVBORw01afer...);
}
```

:::details webpack 配置

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // 10KB 以下的文件采用 url-loader
                            limit: 1024 * 10,
                            // 否则采用 file-loader，默认值就是 file-loader
                            fallback: 'file-loader',
                        },
                    },
                ],
            },
        ],
    },
}
```

:::

### [使用 svg-sprite-loader](https://www.npmjs.com/package/svg-sprite-loader)

> 用于创建 SVG 精灵图的 webpack loader。

Sprites 是自动呈现和注入到页面中的，原理是将多个 svg 合成 SVG `<symbol>`，通过 `symbol id` 来引用图像。

::: warning 注意
Sprites 只需要在项目初始进行一次 HTTP 请求，但在复杂项目中需要注意 Sprites 大小
:::

使用如下

```js
import twitterLogo from './logos/twitter.svg'
// twitterLogo === SpriteSymbol<id: string, viewBox: string, content: string>
// Extract mode: SpriteSymbol<id: string, viewBox: string, url: string, toString: Function>

const rendered = `
<svg viewBox="${twitterLogo.viewBox}">
  <use xlink:href="#${twitterLogo.id}" />
</svg>`
```

webpack runtime 配置如下

```js
// webpack >= 2 multiple loaders
{
  test: /\.svg$/,
  use: [
    {
        loader: 'svg-sprite-loader',
        options: {
          symbolId: filePath => path.basename(filePath)
        }
    },
    'svg-transform-loader',
    'svgo-loader'
  ]
}
```

extract 配置如下 (default false, autoconfigured)

```js
{
  // ......
  options: {
    extract: true,
    spriteFilename: svgPath => `sprite${svgPath.substr(-4)}`
  }
}
```

### [使用 SVGO](https://github.com/svg/svgo?tab=readme-ov-file)

> ⚙️ Node.js tool for optimizing SVG files

SVGO 可以精简压缩文本中的无用信息，对于向量编辑器导出的 SVG 文件能压缩 70%左右（具体表现要看冗余信息量）！

许多应用程序和框架已经依赖或支持 SVGO 的集成。项目里从 `svgo.config.mjs` 读取配置。

项目里一般会设置 `fill: currentColor` 属性，让 SVG 的颜色跟随父元素的 color 值变化

[查阅更多配置项](https://svgo.dev/docs/introduction/)
