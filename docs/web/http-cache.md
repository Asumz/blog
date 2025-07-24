# HTTP 缓存

## 概览

HTTP 缓存会存储与请求关联的响应，并将存储的响应复用于后续请求。

可复用性有几个优点。首先，由于不需要将请求传递到源服务器，因此客户端和缓存越近，响应速度就越快。最典型的例子是浏览器本身为浏览器请求存储缓存。

## 强制缓存

> 对于强制缓存而言，如果浏览器判断所请求的目标资源有效命中，则可直接从强制缓存中返回请求响应，无须与服务器进行任何通信。

### Expires

```http
Expires: Web, 14 Fed 2021 12:23:42 GMT
```

**`Expires`**  响应标头包含响应应被视为过期的日期/时间。

缺陷在于 Expires 过分依赖本地时间，当本地时间和客户端时间不同步时，判断便不能达到预期效果。

如果响应中有指令为  `max-age`  或  `s-maxage`  的  Cache-Control  标头，则  `Expires`  标头会被忽略。

### Cache-Control

**`Cache-Control`**  通用消息头字段，被用于在 http 请求和响应中，通过指定指令来实现缓存机制。缓存指令是单向的，这意味着在请求中设置的指令，不一定被包含在响应中。

#### 禁止缓存

发送如下响应头可以关闭缓存

```http
Cache-Control: no-store
```

#### 缓存静态资源

对于应用程序中不会改变的文件，你通常可以在发送响应头前添加积极缓存。这包括例如由应用程序提供的静态文件，例如图像，CSS 文件和 JavaScript 文件。

```http
Cache-Control: public, max-age=31536000
```

#### 需要重新验证

指定  `no-cache`  或  `max-age=0, must-revalidate`  表示客户端可以缓存资源，每次使用缓存资源前都必须重新验证其有效性。这意味着每次都会发起 HTTP 请求，但当缓存内容仍有效时可以跳过 HTTP 响应体的下载。

```http
Cache-Control: no-cache
```

```http
Cache-Control: max-age=0, must-revalidate
```

::: warning 注意
如果服务器关闭或失去连接，下面的指令可能会造成使用缓存。

```http
Cache-Control: max-age=0
```

:::

## 协商缓存

> 协商缓存就是在使用本地缓存之前，需要向服务器端发起一次 GET 请求，与之协商当前浏览器保存的本地缓存是否已经过期。

### Last-Modified

**`Last-Modified`**  是一个响应首部，其中包含源头服务器认定的资源做出修改的日期及时间。它通常被用作一个验证器来判断接收到的或者存储的资源是否彼此一致。由于精确度比  `ETag`  要低，所以这是一个备用机制。包含有  `If-Modified-Since`  或  `If-Unmodified-Since`  首部的条件请求会使用这个字段。

示例如下 `test.js`

```http
请求字段
Request-URL: http://localhost:3000/test.js
Request-Method: GET
响应字段
Last-Modified: Thu, 29 Apr 2021 03:09:28 GMT
Cache-Control: no-cache
```

当我们刷新网页时，由于客户端浏览器无法确定`test.js`是否过期，所以需要向服务器发送一次 GET 请求协商。此次 GET 请求的请求头中需要包含一个 If-Modified-Since 字段，其值正是上次响应头中 `Last-Modified` 的字段值。

```http
再次请求字段
Request-URL: http://localhost:3000/test.js
Request-Method: GET
If-Modified-Since: Thu, 29 Apr 2021 03:09:28 GMT
再次响应字段
Status-Code: 304 Not Modified
```

::: warning 注意
协商缓存判断缓存有效的响应状态码是 **304** ，即缓存有效响应重定向到本地缓存上。这和强制缓存有所不同，强制缓存若有效，则再次请求的响应状态码是 **200**。
:::

#### 不足

如果请求的文件资源进行了编辑，但内容并没有发生任何变化，时间戳也会更新。从而导致`Last-Modified`判断失效

### ETag

**`ETag`** HTTP 响应头是资源的特定版本的标识符。这可以让缓存更高效，并节省带宽，因为如果内容没有改变，Web 服务器不需要发送完整的响应。

如果给定 URL 中的资源更改，则一定要生成新的  `ETag`  值。比较这些  `ETag`  能快速确定此资源是否变化。

示例如下：

```http
响应字段
Content-Type: image/jpeg
ETag: "xxx"
Last-Modified: Fri, 12 Jul 2021 18:30:00 GMT
Content-Length: 9887
```

::: warning 注意
上述响应中 **ETag** 比 **Last-Modified** 具有更高优先级。
:::

再次对该图片资源发起请求时，会将之前响应头中`ETag`的字段值作为此次请求头中`If-None-Match`字段，提供给服务器进行缓存有效性验证。

```http
再次请求字段
If-Modified-Since: Fri, 12 Jul 2021 18:30:00 GMT
If-None-Match: "xxx"
再次响应字段
Content-Type: image/jpeg ETag: "xxx"
Last-Modified: Fri, 12 Jul 2021 18:30:00 GMT
Content-Length: 9887
```

若验证缓存有效，则返回 **304** 状态码响应重定向到本地缓存，所以上面响应头中的内容长度 `Content-Length` 字段值也就为 0 了。

#### 不足

不像强制缓存中 Cache-Control 可以完全替代 Expires 的功能，在协商缓存中，`ETag` 并非 `Last-Modified` 的替代方案而是一种补充方案，因为它依旧存在一些弊端。

服务器对于生成文件资源的 `ETag` 需要付出额外的计算开销，如果资源的尺寸较大，数量较多且修改比较频繁，那么生成 ETag 的过程就会影响服务器的性能。

## 缓存决策

我们当然希望客户端浏览器上的缓存触发率尽可能高，留存时间尽可能长，同时还要 `ETag` 实现当资源更新时进行高效的重新验证。因此就需要制定合适的缓存策略，来利用有限的资源达到最优的性能效果。

### 缓存决策树

<img src="/img/http-cache.jpg" style="zoom:40%;">

### 项目中的使用

::: tip 提示
CDN 服务一般都会给资源开启很长时间的缓存
:::

针对 HTML 文件：不开启缓存，把 HTML 放到自己的服务器上，而不是 CDN 服务上。

针对静态的 JavaScript、CSS、图片等文件：开启 CDN 和缓存，上传到 CDN 服务上去，同时给每个文件名带上由文件内容算出的 Hash 值， 例如 `app_a6976b6d.css` 文件。 带上 Hash 值的原因是文件名会随着文件内容而变化，只要文件发生变化其对应的 URL 就会变化，它就会被重新下载，无论缓存时间有多长。

::: warning 注意
如果 JavaScript 中包含了用户的私人信息而不想让中间代理缓存，则可为 **Cache-Control** 添加 **private** 属性值。
:::

### 缓存设置注意事项

1. 拆分源码，分包加载
   我们可以考虑在代码构建过程中，按照模块拆分将其打包成多个单独的文件，这样在每次项目迭代时，仅需拉取发生修改的模块。

2. 预估资源的缓存时效
   根据不同资源的不同需求特点，规划相应的缓存更新时效，为强制缓存指定合适的 **max-age** 取值，为协商缓存提供验证更新的 **ETag** 实体标签。

3. 控制中间代理的缓存
   凡是会涉及用户隐私信息的尽量避免中间代理的缓存，如果对所有用户响应相同的资源，则可以考虑让中间代理也进行缓存。

## 参见

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching
