# 了解 JSBridge

## 什么是 JSBridge？

JSBridge 是一种 JS 实现的 Bridge，连接着桥两端的 Native 和 H5。它在 APP 内方便地让 Native 调用 JS，JS 调用 Native ，是*
*双向通信的通道**。JSBridge 主要提供了 JS 调用 Native 代码的能力，实现原生功能如查看本地相册、打开摄像头、指纹支付等。

## JSBridge 的用途

JS 向 Native 发送消息: 调用相关功能、通知 Native 当前 JS 的相关状态等。

Native 向 JS 发送消息: 回溯调用结果、消息推送、通知 JS 当前 Native 的状态等。

## JSBridge 的通信原理

### JavaScript 调用 Native 的方式

主要有两种：注入 API 和 拦截 URL SCHEME。

#### 1. 注入 API

注入 API 方式的主要原理是，通过 WebView 提供的接口，向 JavaScript 的 Context（window）中注入对象或者方法，让 JavaScript
调用时，直接执行相应的 Native 代码逻辑，达到 JavaScript 调用 Native 的目的。

#### 2. 拦截 URL SCHEME

URL Scheme 是一种用于在移动应用程序之间进行通信和跳转的机制。你可以把它想象成应用程序之间的电话号码。

URL Scheme 的格式通常是以应用程序的名字或标识作为前缀，例如跳转微信扫一扫

```
weixin://scanqrcode
```

拦截 URL SCHEME 的主要流程是：Web 端通过某种方式（例如 iframe.src）发送 URL Scheme 请求，之后 Native 拦截到请求并根据 URL
SCHEME（包括所带的参数）进行相关操作。

在时间过程中，这种方式有一定的缺陷：

1. 使用 iframe.src 发送 URL SCHEME 会有 url 长度的隐患。

2. 创建请求，需要一定的耗时，比注入 API 的方式调用同样的功能，耗时会较长。

因此：JavaScript 调用 Native 推荐使用注入 API 的方式

### Native 调用 JavaScript 的方式

直接执行拼接好的 JavaScript 代码即可，从外部调用 JavaScript 中的方法，因此 JavaScript 的方法必须在全局的 window 上。

## JSBridge 接口实现

JSBridge 的接口主要功能有两个：调用 Native（给 Native 发消息） 和 被 Native 调用（接收 Native 消息）。因此，JSBridge 可以设计如下：

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
                callbackId: thisId
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
        }
    }
})()
```

包装一下实现一个 getAuth 如下

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
