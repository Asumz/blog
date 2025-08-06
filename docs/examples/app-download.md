# App 检测与跳转方案实现

## 功能概述

实现一个纯web的智能跳转功能：当目标 App 已安装时直接打开，未安装则跳转到应用商店下载页面。

## 技术实现方案

```javascript
/**
 * 检测应用是否安装并执行相应跳转
 * @param {string} deepLink - 应用的深度链接（URL Scheme）
 * @param {string} fallbackUrl - 应用商店下载链接
 * @param {number} [timeout=2000] - 超时时间（毫秒）
 */
function checkAppInstalled(deepLink, fallbackUrl, timeout = 2000) {
    let timer;
    let appLaunched = false;

    // 监听页面状态变化以确认应用已启动
    const cleanup = () => {
        appLaunched = true;
        clearTimeout(timer);
        window.removeEventListener('pagehide', cleanup);
        window.removeEventListener('blur', cleanup);
    };

    window.addEventListener('pagehide', cleanup);
    window.addEventListener('blur', cleanup);

    // 尝试通过iframe触发应用跳转
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 100);

    // 设置超时回退
    timer = setTimeout(() => {
        if (!appLaunched) {
            window.location.href = fallbackUrl;
        }
    }, timeout);
}

// 使用示例：绑定到按钮点击事件
document.getElementById('openAppBtn').addEventListener('click', () => {
    checkAppInstalled('weixin://', 'https://weixin.qq.com/download');
});
```

## 浏览器兼容性说明

1. **微信浏览器**：
    - 会拦截 URL Scheme 跳转
    - 但允许跳转到应用商店 `itms-appss://`

2. **iOS Safari (17+，可能更早)**：
    - 会拦截 iframe 跳转方式
    - 但允许直接通过 URL Scheme 跳转

3. **其他浏览器**：
    - 实现效果因浏览器策略而异

## 知乎的跳转实现方案

知乎在移动端浏览器采用了直接通过`location.href`执行URL Scheme跳转的技术方案，这种实现方式无需用户主动点击即可触发应用跳转行为。

### 跳转效果展示

**应用未安装场景**
![应用未安装状态下的跳转效果](https://img.souche.com/bolt/W1BgtuRgzRD1iyuVaAktY/3b1e0ac305f438f5e86d71e48070e123.jpg){width=300}

**应用已安装场景**
![应用已安装状态下的跳转效果](https://img.souche.com/bolt/QXuKAZYg-iPiG2MPN8lgz/d7290cac0acc2479f60789ef33c6d970.jpg){width=300}

该方案通过JavaScript直接修改location.href属性触发跳转，相比用户主动点击的方式，能够提升应用调起率，但需要注意处理应用未安装时的降级逻辑。