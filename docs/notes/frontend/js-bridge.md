# 了解 jsBridge

## 什么是 jsBridge？

jsBridge 是一种 js 实现的 bridge，连接着桥两端的 native 和 h5。它在 app 内方便地让 native 调用 js，js 调用 native，是\*\*双向通信的通道\*\*。jsBridge 主要提供了 js 调用 native 代码的能力，实现原生功能如查看本地相册、打开摄像头、指纹支付等。

## jsBridge 的用途

js 向 native 发送消息：调用相关功能、通知 native 当前 js 的相关状态等。

native 向 js 发送消息：回溯调用结果、消息推送、通知 js 当前 native 的状态等。

## jsBridge 的通信原理

### js 调用 native 的方式

主要有两种：注入 api 和拦截 urlScheme。

#### 1. 注入 api

注入 api 方式的主要原理是，通过 webView 提供的接口，向 js 的 context（window）中注入对象或者方法，让 js 调用时直接执行相应的 native 代码逻辑，达到 js 调用 native 的目的。

#### 2. 拦截 urlScheme

urlScheme 是一种用于在移动应用程序之间进行通信和跳转的机制。你可以把它想象成应用程序之间的电话号码。

urlScheme 的格式通常是以应用程序的名字或标识作为前缀，例如跳转微信扫一扫。

```
weixin://scanqrcode
```

拦截 urlScheme 的主要流程是：web 端通过某种方式（例如 iframe.src）发送 urlScheme 请求，之后 native 拦截到请求并根据 urlScheme（包括所带参数）进行相关操作。

在时间过程中，这种方式有一定的缺陷：

1. 使用 iframe.src 发送 urlScheme 会有 url 长度隐患。

2. 创建请求需要一定耗时，比注入 api 的方式调用同样的功能更慢。

因此：js 调用 native 推荐使用注入 api 的方式。

### native 调用 js 的方式

直接执行拼接好的 js 代码即可，从外部调用 js 中的方法，因此 js 方法必须挂载在全局 window 上。

## jsBridge 接口实现

jsBridge 的接口主要功能有两个：调用 native（给 native 发消息）和被 native 调用（接收 native 消息）。因此，jsBridge 可以设计如下：

```javascript
;(function () {
  // 唯一标识符
  var id = 0
  // 回调函数仓库
  var callbacks = {}
  window.JSBridge = {
    // 给 Native 发消息
    postMessage: function (bridgeName, callback, data) {
      var thisId = id++
      callbacks[thisId] = callback
      // 构建一个包含消息和唯一标识符的对象
      const request = {
        bridgeName: bridgeName,
        data: data || {},
        callbackId: thisId,
      }
      // 判断环境，使用 Native 端提供的方法发送消息
      nativeBridge.postMessage(request)
    },
    // 接收 Native 消息
    receiveMessage: function (msg) {
      // 接收数据
      var { bridgeName, data = {}, callbackId } = msg

      if (callbackId !== undefined) {
        if (callbacks[callbackId]) {
          callbacks[callbackId](data)
        }
      } else {
        // 异常处理
      }
    },
  }
})()
```

包装一下，实现一个 `getAuth` 如下。

```javascript
function getAuth() {
  return new Promise((resolve, reject) => {
    window.JSBridge.postMessage('getAuth', data => {
      if (data.err_code !== 0) {
        resolve(data.data)
      } else {
        reject(data.msg)
      }
    })
  })
}
// usage
getAuth()
  .then(data => {
    // doSomething
  })
  .catch(err => {
    // 异常处理
  })
```
