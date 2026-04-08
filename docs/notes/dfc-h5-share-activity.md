# h5 分享活动

## 需求背景

构建一套 h5 页面，同时支持 app / 小程序 / 朋友圈浏览器运行

## 场景1：多端支付

**技术实现**：

| 端类型                  | 解决方案       | 关键技术点                                                                                |
| ----------------------- | -------------- | ----------------------------------------------------------------------------------------- |
| **app**                 | native 收银台  | 收银台 sdk                                                                                |
| **微信小程序(Android)** | 支付中转页方案 | window.wx.miniProgram.navigateTo() <br/> 通过中转页绕开小程序 onMessage 限制              |
| **微信小程序(iOS)**     | 客服兜底方案   | 1. 识别 `UA` 屏蔽支付按钮<br>2. 跳转客服会话链接<br>⚠️ 虚拟商品：iOS 端不能直接用微信支付 |

## 场景2：应用下载

**下载策略（文字简述）**：

用户点击下载后，先做「下载渠道判断」：

- **微信小程序**：进入 about 页 → 展示静态二维码（引导扫码下载）。
- **朋友圈 / H5 分享**：进入公有下载页 → 再做环境判断，并跳转对应应用商店。

[下载页](https://xdfcxiazai.souche.com/)

## 场景3：小程序 webView 状态同步难题

**微信限制下的解决方案**：

```javascript
// 小程序端
export default class MonthlyPass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      refresh: true,
    }
  }

  async setUrl() {
    let urls = {
      development: 'development/#/dfc-h5-share-activity',
      prepub: 'prepub/#/dfc-h5-share-activity',
      production: 'production/#/dfc-h5-share-activity',
    }
    let url = urls[process.env.NODE_ENV]

    let qs = await this.getQueryString()
    url += qs

    this.setState({ url, refresh: true })
  }

  render() {
    return (
      <View>
        <WebView src={this.state.refresh ? this.state.url : ''} onMessage={this.handleMessage} />
      </View>
    )
  }
}
```

## 场景4：app 端绘制海报

1. 防止图片模糊

```javascript
const dpr = window.devicePixelRatio || 1
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

// 设置Canvas实际大小
canvas.width = width * dpr
canvas.height = height * dpr

// 设置Canvas显示大小
canvas.style.width = `${width}px`
canvas.style.height = `${height}px`

// 缩放绘图上下文以补偿DPR
ctx.scale(dpr, dpr)
```

2. 通过 Worker 离屏渲染

3. 降低图片质量

4. 压缩图像尺寸
