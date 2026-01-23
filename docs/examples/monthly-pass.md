# 月卡分享活动

## 需求背景

发起通过月卡活动引流。构建一套 H5 页面同时支持APP/小程序/朋友圈运行

## 场景1：多端支付

**技术实现**：

| 端类型                | 解决方案             | 关键技术点                                                                                                           |
|--------------------|------------------|-----------------------------------------------------------------------------------------------------------------|
| **APP**            | 直接调用Native收银台SDK | `mars://open/jarvisWebview?url=?......`                                                                         |
| **微信小程序(Android)** | 支付中转页方案          | window.wx.miniProgram.navigateTo({ url: `/pages/monthly-pass/pay?orderParams=${JSON.stringify(orderParams)}`}); |
| **微信小程序(iOS)**     | 客服兜底方案           | 1. 识别`UA`屏蔽支付按钮<br>2. 跳转客服会话链接<br>⚠️ 虚拟商品：iOS 端不能直接用微信支付                                                        |

## 场景2：应用下载

**下载策略拓扑图**：

![dfc-download.svg](/img/dfc-download.svg){width="60%"}

[下载页](https://xdfcxiazai.souche.com/)

## 场景3：小程序WebView状态同步难题

**微信限制下的解决方案**：

```javascript
// 小程序端
export default class MonthlyPass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: '',
            refresh: true,
        };
    }

    async setUrl() {
        let urls = {
            development: 'development/#/monthly-pass',
            prepub: 'prepub/#/monthly-pass',
            production: 'production/#/monthly-pass',
        };
        let url = urls[process.env.NODE_ENV];

        let qs = await this.getQueryString();
        url += qs;

        this.setState({url, refresh: true});
    }

    render() {
        return (
            <View>
                <WebView
                    src={this.state.refresh ? this.state.url : ''}
                    onMessage={this.handleMessage}
                />
            </View>
        );
    }
}
```

## 场景4：H5跳转小程序最佳实践

[隐私访问](https://www.yuque.com/fangxiang-rrcse/whgivz/xg2kxqwq0zl9z3fg)

## 场景5：APP端绘制海报

[绘制海报](draw-poster.md)

