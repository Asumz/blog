---
outline: [2, 3]
---

# 理解 BFC

**区块格式化上下文**（Block Formatting Context，BFC）是 Web 页面的可视 CSS 渲染的一部分，是块级盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

## 下列方式会创建 BFC

-   文档的根元素（`<html>`）。
-   浮动元素（`float` 值不为  `none`  的元素）。
-   绝对定位元素（`position` 值为  `absolute`  或  `fixed`  的元素）。
-   行内块元素（`display` 值为  `inline-block`  的元素）。
-   表格元素（`display` 值为 `table`、 `table-cell`、`table-caption`、`table-row`、`table-row-group`、`table-header-group`、`table-footer-group` 或  `inline-table` 的元素）
-   `overflow` 值不为  `visible`  或  `clip`  的块级元素。
-   `display` 值为  `flow-root`  的元素。
-   `contain` 值为  `layout`、`content`  或  `paint`  的元素。
-   弹性元素（`display` 值为  `flex`  或  `inline-flex`  元素的直接子元素），如果它们本身既不是弹性、网格也不是表格容器。
-   网格元素（`display` 值为  `grid`  或  `inline-grid`  元素的直接子元素），如果它们本身既不是弹性、网格也不是表格容器。
-   多列容器（`column-count` 或  `column-width` 值不为  `auto`，且含有  `column-count: 1`  的元素）。
-   `column-span`  值为  `all`  的元素始终会创建一个新的格式化上下文，即使该元素没有包裹在一个多列容器中。

## BFC 的作用

通常，我们会为定位和清除浮动创建新的 BFC，而不是更改布局。

::: tip 备注
弹性/网格容器（`display`：flex/grid/inline-flex/inline-grid）建立新的弹性/网格格式化上下文，除布局之外，它与 BFC 类似。弹性/网格容器中没有可用的浮动子级，但排除外部浮动和阻止外边距重叠仍然有效。
:::

### 包含内部浮动

BFC 使得让浮动内容和周围的内容等高。

在下面的例子中，我们让  `<div>`  元素浮动，并给它应用  `border`  效果。`<div>`  里的内容现在已经在浮动元素周围浮动起来了。由于浮动的元素比它旁边的元素高，所以  `<div>`  的边框穿出了浮动。因为浮动脱离了文档流，所以  `<div>`  的  `background`  和  `border`  仅仅包含了内容，不包含浮动。

**使用  `overflow: auto`**

使用  `overflow`  创建新的 BFC，是因为  `overflow`  属性会告诉浏览器应该怎样处理溢出的内容。通常的做法是设置父元素  `overflow: auto`  或者其他除默认的  `overflow: visible`  以外的值。`<div>`  元素变成布局中的小型布局，任何子元素都会被包含进去。

:::tip 副作用
如果使用它仅仅为了创建 BFC，你可能会遇到不希望出现的滚动条或阴影。
:::

**使用  `display: flow-root`**

一个新的  `display`  属性的值，它可以创建无副作用的 BFC。在父级块中使用  `display: flow-root`  可以创建新的 BFC。行为如同  `root`（在浏览器中是  `<html>`）元素。

::: details HTML

```html
<section>
    <div class="box">
        <div class="float">我是浮动的盒子！</div>
        <p>我是容器内的内容。</p>
    </div>
</section>
<section>
    <div class="box" style="overflow:auto">
        <div class="float">我是浮动的盒子！</div>
        <p>我是 <code>overflow:auto</code> 容器内部的内容。</p>
    </div>
</section>
<section>
    <div class="box" style="display:flow-root">
        <div class="float">我是浮动的盒子！</div>
        <p>我是 <code>display:flow-root</code> 容器内部的内容。</p>
    </div>
</section>
```

:::

:::details CSS

```css
section {
    height: 150px;
}
.box {
    background-color: rgb(224, 206, 247);
    border: 5px solid rebeccapurple;
}
.box[style] {
    background-color: aliceblue;
    border: 5px solid steelblue;
}
.float {
    float: left;
    width: 200px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid black;
    padding: 10px;
}
```

:::

示例

<section>
    <div class="box">
        <div class="float">我是浮动的盒子！</div>
        <p>我是容器内的内容。</p>
    </div>
</section>
<section>
    <div class="box" style="overflow:auto">
        <div class="float">我是浮动的盒子！</div>
        <p>我是 <code>overflow:auto</code> 容器内部的内容。</p>
    </div>
</section>
<section>
    <div class="box" style="display:flow-root">
        <div class="float">我是浮动的盒子！</div>
        <p>我是 <code>display:flow-root</code> 容器内部的内容。</p>
    </div>
</section>

<style scoped>
section {
    height: 150px;
}
.box {
    background-color: rgb(224, 206, 247);
    border: 5px solid rebeccapurple;
}
.box[style] {
    background-color: aliceblue;
    border: 5px solid steelblue;
}
.float {
    float: left;
    width: 200px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid black;
    padding: 10px;
}
</style>

### 排除外部浮动

下面的例子中，我们使用  `display: flow-root`  和浮动实现双列布局，因为正常文档流中建立的 BFC 不得与元素本身所在的块格式化上下文中的任何浮动的外边距重叠。

::: details HTML

```html
<section>
    <div class="float">试试重新调整这个外部浮动元素的大小</div>
    <div class="box"><p>普通</p></div>
</section>
<section>
    <div class="float">试试重新调整这个外部浮动元素的大小</div>
    <div class="box" style="display:flow-root">
        <p><code>display:flow-root</code></p>
        <p></p>
    </div>
</section>
```

:::

::: details CSS

```css
section {
    height: 150px;
}
.box {
    background-color: rgb(224, 206, 247);
    border: 5px solid rebeccapurple;
}
.box[style] {
    background-color: aliceblue;
    border: 5px solid steelblue;
}
.float {
    float: left;
    overflow: hidden; /* resize:both 所必需的样式 */
    resize: both;
    margin-right: 25px;
    width: 200px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.75);
    border: 1px solid black;
    padding: 10px;
}
```

:::

示例

<section>
    <div class="float">试试重新调整这个外部浮动元素的大小</div>
    <div class="box"><p>普通</p></div>
</section>
<section>
    <div class="float">试试重新调整这个外部浮动元素的大小</div>
    <div class="box" style="display:flow-root">
        <p><code>display:flow-root</code></p>
        <p></p>
    </div>
</section>

<style scoped>
section {
  height: 150px;
}
.box {
  background-color: rgb(224, 206, 247);
  border: 5px solid rebeccapurple;
}
.box[style] {
  background-color: aliceblue;
  border: 5px solid steelblue;
}
.float {
  float: left;
  overflow: hidden; /* resize:both 所必需的样式 */
  resize: both;
  margin-right: 25px;
  width: 200px;
  height: 100px;
  background-color: rgba(255, 255, 255, 0.75);
  border: 1px solid black;
  padding: 10px;
}

</style>

与  `inline-block`  需要设置  `width: <percentage>`  不同的是，在示例中，我们不需要设置右侧  `div`  元素的宽度。

请注意，弹性盒子是在现代 CSS 中实现多列布局的更有效的方法。

### 防止外边距重叠

相邻的几个  `<div>`  元素，每个元素在垂直方向上含有  `10px`  的外边距。由于外边距重叠作用，垂直方向上它们之间将具有 `10px` 的间距，而不是所期望的 `20px`。

我们将第二个 `<div class="blue">` 包裹在另外一个 `<div>` 之中，以创建一个新的 BFC，防止外边距重叠。

HTML

```html
<div class="blue"></div>
<div class="red"></div>
<div class="outer">
    <div class="blue"></div>
</div>
```

CSS

```css
.blue,
.red {
    height: 50px;
    margin: 10px 0;
}

.blue {
    background: blue;
}

.red {
    background: red;
}
.outer {
    overflow: hidden;
    background: transparent;
}
```

示例

<div class="blue"></div>
<div class="red"></div>
<div class="outer">
    <div class="blue"></div>
</div>

<style scoped>
.blue, .red {
    height: 50px;
    margin: 10px 0;
}

.blue {
    background: blue;
}

.red {
    background: red;
}

.outer {
    overflow: hidden;
    background: transparent;
}
</style>
