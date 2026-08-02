# RTL 遇上移动端：PostCSS 自动翻转后的特异性陷阱

## 一个看起来违反 CSS 常识的问题

HugeAuto 加入阿拉伯语后，我使用 `postcss-rtlcss` 的 combined 模式生成 LTR 和 RTL 样式。桌面端改造完成后，我开始处理移动端，其中首页 Hero 的定位方式需要发生变化：

- 桌面端绝对定位，水平居中覆盖在轮播图上
- 移动端回到普通文档流，避免搜索区和条件面板飞出屏幕

桌面样式大致是：

```less
.page-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
```

移动端覆盖写在后面：

```less
@media (max-width: 480px) {
  .page-center {
    position: static;
    left: auto;
    transform: none;
  }
}
```

按我过去对 CSS 层叠的理解，两条规则特异性相同，媒体查询中的规则又在后面，移动端理应覆盖成功。

实际结果却是 `position: static` 生效了，`transform: none` 没有生效。元素虽然回到了文档流，仍然带着桌面端的水平位移。

## 我最初怀疑了错误的方向

看到这个现象时，我先后检查了几件事：

1. 移动端 Less 是否真的被组件引入
2. scoped style 是否导致选择器没有命中
3. HMR 是否还保留旧 CSS
4. Ant Design 样式是否覆盖了业务规则
5. 媒体查询在横屏设备上是否生效

这些检查都没有发现问题。移动端规则出现在 DevTools 中，`left: auto` 和 `transform: none` 也确实被划掉了。

一开始我仍然盯着 Less 源码，认为可能是文件顺序问题。直到展开浏览器中的完整选择器，我才注意到：真正参与竞争的并不是我写下的两个 `.page-center`。

## RTL 插件改变了最终选择器

桌面规则包含 `left` 和方向性的 `translateX`。combined 模式会为它生成带 `dir` 的版本，概念上类似：

```css
[dir='ltr'] .page-center[data-v-xxx] {
  left: 50%;
  transform: translateX(-50%);
}

[dir='rtl'] .page-center[data-v-xxx] {
  right: 50%;
  transform: translateX(50%);
}
```

选择器中多出的 `[dir]` 提高了特异性。

移动端写的是 `left: auto` 和 `transform: none`。这些值在 LTR 与 RTL 下没有区别，插件没有必要为它们再生成两个方向版本，于是最终仍接近：

```css
@media (max-width: 480px) {
  .page-center[data-v-xxx] {
    left: auto;
    transform: none;
  }
}
```

到这里，问题才解释得通：后面的移动端规则特异性低于前面的方向规则，所以源码顺序已经无法决定结果。

这也是为什么 `position: static` 能生效。position 本身没有方向性，桌面端没有一个带 `[dir]` 的更高特异性版本与它竞争。

## 我考虑过三种修复方式

### 给移动端规则加 !important

这是最快的做法：

```less
.page-center {
  transform: none !important;
}
```

但它会把问题留给下一次覆盖。以后如果某个设备或页面状态还要改变 transform，只能继续堆 `!important`。我不希望一个由构建工具引起的局部冲突，最后变成全局的样式优先级债务。

### 手写 dir 选择器

也可以让移动端规则与生成结果保持一致：

```less
[dir='ltr'] .page-center,
[dir='rtl'] .page-center {
  transform: none;
}
```

但项目已经选择自动生成 RTL。业务源码再手写一套方向选择器，会让同一条规则同时受到人工和插件控制，很难判断最终会生成什么。

### 只补足这一条规则的特异性

最后我选择重复类名：

```less
@media @mobile-media {
  .page-center.page-center {
    position: static;
    top: auto;
    left: auto;
    transform: none;
    display: block;
  }
}
```

它让移动端规则达到足以覆盖 `[dir]` 版本的特异性，同时没有 `!important` 的后续限制。

重复类名当然不是我希望在项目里普遍使用的写法。我把它视为一次外科手术：只用于明确知道编译产物为何提高特异性的地方，并在源码旁写清原因。

## 这个问题还暴露了行内样式的盲区

继续检查 RTL 页面时，我发现一些方向性声明写在 Vue 模板的 style 属性中：

```vue
<div style="margin-left: 12px; transform: translateX(-50%)" />
```

PostCSS 根本看不到这些内容，自然也不会生成 RTL 版本。它们在英文页面没有问题，切到阿拉伯语后却始终保持原方向。

我后来把这类样式迁移到 class。这个修改看起来像代码风格整理，实际上是在决定哪些样式能够进入自动化管线。

能够使用逻辑属性的地方，我也尽量不再写 left/right：

```less
.card {
  margin-inline-start: 12px;
  padding-inline-end: 16px;
  border-inline-start: 1px solid var(--color-border);
  text-align: start;
}
```

逻辑属性由浏览器根据 `dir` 解释，不需要 RTL 插件生成额外选择器，也就少了一层特异性变化。

不过 transform、绝对定位和方向图标仍然需要单独判断，逻辑属性并不能覆盖所有场景。

## RTL 页面不是一张镜像图

排查样式时，我也曾经下意识地认为“方向不对就翻转”。真正检查内容后，这个想法很快失效了。

电话号码、邮箱、VIN、价格数字和代码片段应该保持 LTR，可以局部使用：

```html
<span dir="ltr">+852 0000 0000</span>
```

品牌 Logo、汽车图片和播放按钮通常也不应该镜像。返回箭头、上一页和下一页则需要跟随阅读方向。

插件只能识别 CSS 属性是否带方向，无法理解图标或图片的业务含义。这一部分没有办法完全自动化。

## 响应式 px 又增加了一层观察难度

项目还有一个自定义 PostCSS 插件，会把源码中的大多数 px 转换成响应式 token：

```less
.card {
  width: 320px;
  padding: 24px;
  border: 1px solid var(--color-border);
}
```

构建后接近：

```css
.card {
  width: calc(320 * var(--px));
  padding: calc(24 * var(--px));
  border: 1px solid var(--color-border);
}
```

`0` 和边框使用的 `1px` 会保持不变，其他尺寸跟随 `--px` 缩放。移动端还会改变布局结构，而不仅仅是缩小尺寸。

这意味着我在 DevTools 里看到的最终 CSS，可能已经同时经过 px 转换、前缀处理、RTL 拆分和 Vue scoped 改写。继续只看 Less 源码，很容易对真实选择器和属性值产生错误判断。

## 后来我改变了排查顺序

再遇到类似“后写规则不生效”的问题时，我不会先继续增加覆盖代码，而是先看浏览器中最终胜出的完整选择器。

这次问题最后只改了一个很小的选择器，但定位它需要理解整条构建链：方向性属性触发 RTL 拆分，对称重置值没有拆分，scoped style 又给两边增加属性选择器，最后改变了原本看起来相同的优先级。

它也让我对 CSS 自动化工具更谨慎。自动翻转可以消灭大量重复工作，却不会保证编译后的层叠关系仍然和源码直觉一致。工具替我写了 CSS，但调试时，我仍然需要对它写出的结果负责。
