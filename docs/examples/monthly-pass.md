# 9.9维保月卡权益活动

## 需求背景

发起通过9.9元维保月卡权益活动，用于吸引更多新用户使用维保，提升维保查询单量

一套H5页面同步支持APP、小程序、微信浏览器多端运行

## **跨端兼容性解决方案**

### 场景1：多端支付链路统一

**问题本质**：WebView与原生容器通信协议差异导致的支付路径分裂  
**技术实现**：

| 端类型                | 解决方案             | 关键技术点                                                                                                           |
|--------------------|------------------|-----------------------------------------------------------------------------------------------------------------|
| **APP**            | 直接调用Native收银台SDK | `mars://open/jarvisWebview?url=?......`                                                                         |
| **微信小程序(Android)** | 支付中转页方案          | window.wx.miniProgram.navigateTo({ url: `/pages/monthly-pass/pay?orderParams=${JSON.stringify(orderParams)}`}); |
| **微信小程序(iOS)**     | 客服兜底方案           | 1. 识别`UA`屏蔽支付按钮<br>2. 跳转客服会话链接                                                                                  |

### 场景2：应用下载引导体系

**降级策略拓扑图**：

![monthly-pass](/img/monthly-pass.svg){width="60%"}

**关键技术实现**：

1. **二维码生成优化**
    - 添加`长按识别`引导蒙层（兼容微信图片拦截策略）

### 场景3：WebView状态同步难题

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

### 场景4：H5跳转小程序最佳实践

[隐私访问](https://www.yuque.com/fangxiang-rrcse/whgivz/xg2kxqwq0zl9z3fg)
