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
