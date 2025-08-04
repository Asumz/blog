# 移动端H5 Canvas绘制海报

## 字体模糊问题

在移动端H5中使用Canvas绘制海报时，确实可能会出现字体模糊的情况。以下是主要原因和解决方案：

### 主要原因

1. **设备像素比(DPR)问题**：移动设备通常有高DPI屏幕(如Retina屏)，DPR大于1(通常是2或3)，如果不做适配会导致绘制模糊。

2. **Canvas尺寸与CSS尺寸不匹配**：Canvas的实际像素(width/height属性)与CSS样式尺寸不一致时，浏览器会拉伸图像导致模糊。

3. **字体渲染差异**：不同移动设备对字体的渲染方式不同，可能导致显示效果不一致。

### 解决方案

1. **适配设备像素比(DPR)**：

```javascript
const dpr = window.devicePixelRatio || 1;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 设置Canvas实际大小
canvas.width = width * dpr;
canvas.height = height * dpr;

// 设置Canvas显示大小
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;

// 缩放绘图上下文以补偿DPR
ctx.scale(dpr, dpr);
```

2. **使用合适的字体设置**：

```javascript
ctx.font = 'bold 16px "PingFang SC", "Microsoft YaHei", sans-serif';
ctx.textBaseline = 'top'; // 设置文本基线
```

3. **字体抗锯齿优化**：

```javascript
ctx.textRendering = 'optimizeLegibility';
```

4. **整数坐标绘制**：确保文本的x,y坐标为整数，避免亚像素渲染

```javascript
ctx.fillText('文本内容', Math.round(x), Math.round(y));
```

5. **使用高质量的图片资源**：如果海报中包含图片，确保图片分辨率足够高。

### 其他注意事项

- 测试不同移动设备和浏览器，特别是iOS和Android的差异
- 避免使用过小的字号(建议不小于12px)
- 考虑使用web字体时预加载字体文件
- 对于复杂海报，可以尝试使用html2canvas等库，但也要注意其模糊问题

## 缩放后图片过大问题

对于移动端H5海报中使用的十几MB大图片，以下是几种有效的压缩方法和技巧：

1. **降低图片质量（逐步降低质量直到视觉可接受）**

2. **在 Web Worker 中处理复杂的图像绘制，避免主线程卡顿**

:::details
主线程

```js
const canvas = document.getElementById('myCanvas');
const offscreen = canvas.transferControlToOffscreen(); // 转移控制权
const worker = new Worker('worker.js');

// 加载图片
const img = new Image();
img.crossOrigin = 'anonymous'; // 处理跨域图片（如果需要）
img.src = 'image.png';

img.onload = () => {
    // 创建 ImageBitmap（更高效，适合 Worker 传输）
    createImageBitmap(img).then(bitmap => {
        // 将 OffscreenCanvas 和 ImageBitmap 发送给 Worker
        worker.postMessage(
            {canvas: offscreen, image: bitmap},
            [offscreen, bitmap] // 转移所有权
        );
    });
};
```

worker

```js
self.onmessage = async (e) => {
    const {canvas, image} = e.data;
    const ctx = canvas.getContext('2d'); // 获取 OffscreenCanvas 的 2D 上下文

    // 绘制图片
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvas.convertToBlob({
        type: 'image/png',
        quality: 0.75,
    });

    self.postMessage({blob}, [ /** blob */]);
    // 清理 ImageBitmap
    image.close();
};
```

:::

3. **格式上可选择webp**

:::details

```javascript
// 前端检测浏览器是否支持WebP
function isWebPSupported() {
    return document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;
}
```

:::

4. **压缩 Canvas 图像尺寸**

:::details

```javascript
/**
 * 压缩 Canvas 图像尺寸
 * @param {HTMLCanvasElement} sourceCanvas - 原始Canvas元素
 * @param {number} scaleFactor - 缩放比例 (0-1)
 * @param {string} [imageType='image/jpeg'] - 输出图像类型
 * @param {number} [quality=0.8] - 图像质量 (0-1)
 * @returns {Promise<Blob>} 返回压缩后的Blob对象
 */
function compressCanvasSize(sourceCanvas, scaleFactor, imageType = 'image/jpeg', quality = 0.8) {
    return new Promise((resolve, reject) => {
        try {
            // 创建缩小尺寸的Canvas
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = sourceCanvas.width * scaleFactor;
            smallCanvas.height = sourceCanvas.height * scaleFactor;

            // 绘制缩小版本
            const ctx = smallCanvas.getContext('2d');
            ctx.drawImage(sourceCanvas, 0, 0, smallCanvas.width, smallCanvas.height);

            // 转换为Blob
            smallCanvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error('Canvas转Blob失败')),
                imageType,
                quality
            );
        } catch (error) {
            reject(error);
        }
    });
}
```

:::
