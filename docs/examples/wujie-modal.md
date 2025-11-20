# 无界微前端项目主应用调用子应用弹窗

## 需求背景

收款单表单页改造为抽屉弹出，避免打开新页面跳转使用更快捷

PC 项目是由[无界](https://wujie-micro.github.io/doc/guide/start.html)微前端搭建，主应用和子应用采用相同的技术栈
React，表单页是创建在子应用（财务系统）中的，且主应用和子应用都有多处需要跳转表单页，且提交后有回调操作。

## 技术方案对比

以下是三种技术方案的对比分析：

| 方案名称    | 实现方式                        | 优势                                 | 劣势                             | 推荐度   |
|---------|-----------------------------|------------------------------------|--------------------------------|-------|
| 业务迁移方案  | 将收款单业务完整迁移至主应用，由主应用实现弹窗功能   | • 无重大技术障碍                          | • 业务逻辑复杂，重构成本高<br>• 破坏现有系统业务边界 | ❌ 不推荐 |
| 弹窗嵌入方案  | 保持表单页不变，将子应用整体嵌入主应用弹窗容器     | • 代码重构量小<br>• 维护系统业务边界清晰           | • 子应用强依赖主应用环境，独立开发调试困难         | ❌ 不推荐 |
| 应用间通信方案 | 子应用暴露全局弹窗实例，通过微前端通信机制供主应用调用 | • 保持独立开发能力<br>• 架构解耦清晰<br>• 重构成本最低 | • 需要建立应用间通信机制<br>• 需规范接口调用约定   | ✅ 推荐  |

## 关键技术问题

### 1. 隐式渲染与显示效果

**问题**：子应用在宽高为0的空白路由中渲染，弹窗能否正常展示？

**结论**：可以正常展示。无界采用Web
Components而非iframe，子应用组件可突破容器边界正常渲染。[无界实现原理](https://wujie-micro.github.io/doc/guide/#iframe-%E8%BF%9E%E6%8E%A5%E6%9C%BA%E5%88%B6%E5%92%8C-css-%E6%B2%99%E7%AE%B1%E6%9C%BA%E5%88%B6)

### 2. 二次弹窗层级与定位

**问题**：二次确认弹窗超出抽屉范围能否正常显示？

**结论**：可以正常显示。弹窗基于整个视口定位，不受父级容器裁剪影响。

### 3. 无界通信方案选择

| 方案         | 评估                                  | 状态 |
|------------|-------------------------------------|----|
| Bus事件总线    | • 存在多实例（先前业务导致）广播问题<br>• 一次操作触发多次回调 | ❌  |
| Window单点通信 | • 精准控制单个子应用实例<br>• 避免重复回调           | ✅  |

### 4. 全局弹窗封装设计

- **接口标准化**：保持父子应用间接口一致性
- **上下文共享**：弹窗因为具备业务属性，创建于`<App/>`下，确保业务上下文完整传递
- **组件适配**：主应用Hook通过HOC包装适配Class组件

### 5. 实例加载状态处理

**问题**：子应用未加载完成时实例为undefined

**解决方案**：

- 监听无界生命周期事件，精确获取子应用状态
- 渲染完成前，弹窗按钮显示loading状态

## 具体实现

### 主应用 A 代码

:::details hooks 实现

```js
// src/hooks/useSubApp.js;
import WujieReact from 'wujie-react'
import React, {useEffect, useState} from 'react'
import ReactDom from 'react-dom'

const isLocal = window.location.origin.includes('localhost')
const local = 'http://localhost:3001'
const online = process.env.subAppHost + '/projects/Mars_WEB/mars-web-finance'
const origin = isLocal ? local : online

const subAppName = 'finance-blank'
const subAppUrl = origin + '/#/blank'
let /** @type {any} 绑定iframe单例 */ subAppWindow = null

const HiddenSubApp = ({setReady}) => {
    return (
        <WujieReact
            width="0"
            height="0"
            name={subAppName}
            url={subAppUrl}
            afterMount={appWindow => {
                setReady(true)
                if (!subAppWindow) subAppWindow = appWindow
            }}
        />
    )
}

const useShadow = () => {
    const [ready, setReady] = useState(false) // shadow创建后可以调用子应用方法

    useEffect(() => {
        let div = document.createElement('div')
        document.body.appendChild(div)
        ReactDom.render(<HiddenSubApp setReady={setReady}/>, div)
        return () => {
            div.remove()
        }
    }, [])

    return {ready}
}

export const useReceiptsDrawer = () => {
    const {ready} = useShadow()

    const getInstance = () => subAppWindow?.receiptsDrawerHandler

    /**
     * ReceiptsDrawer参数
     * @typedef {Object} ReceiptsDrawerProps
     * @property {string} [carId]
     * @property {string} sourceCode - COLLECTION_ORDER | SALE_ORDER
     * @property {string} [associatedSourceId] - 关联销售订单ID
     * @property {string} [recordId] - 收款单ID
     * @property {string} createType - 创建方式 | receipt | receiptBack
     */

    const show = (/** @type {ReceiptsDrawerProps} */ data) => {
        getInstance().show(data)
    }

    const hide = () => {
        getInstance().hide()
    }

    const afterConfirm = (/** @type {(data: any) => void} */ cb) => {
        getInstance().afterConfirm(cb)
    }

    return {
        ready,
        show,
        hide,
        afterConfirm,
    }
}

// 抽象了一下创建实例的逻辑，可以参考useReceiptsDrawer拓展 useOthers
```

:::

项目混用了 class 和 function 组件，class 无法直接调用 hooks，构造一个 HOC

```js
import React from 'react'
import {useReceiptsDrawer} from '@/components/hooks/useSubApp'

export const withReceiptsDrawer = Component => {
    return props => {
        const receiptsHandler = useReceiptsDrawer()
        return <Component receiptsHandler={receiptsHandler} {...props} />
    }
}

// 调用 withReceiptsDrawer(ClassComponent)
```

### 子应用 B 代码

:::details 组件实现，创建全局调用方法

```js
// src/components/ReceiptsDrawer/index.js;
import React, {useEffect, useState} from 'react'
import {Drawer} from 'antd'
import CreateReceipt from '@/pages/Receipt/CreateReceipt'
import eventBus, {eventBusCode} from '@/event-bus'

export const ReceiptsDrawer = () => {
    const [visible, setVisible] = useState(false)
    const [config, setConfig] = useState({})
    const [receiptsProps, setReceiptsProps] = useState({})

    const show = (receiptsProps = {}) => {
        console.log('receiptsProps', receiptsProps)
        setReceiptsProps(receiptsProps)
        setVisible(true)
    }

    const hide = () => {
        setVisible(false)
    }

    const afterConfirm = cb => {
        eventBus.off(eventBusCode.afterReceiptsDrawerConfirm)
        eventBus.on(eventBusCode.afterReceiptsDrawerConfirm, cb)
    }

    useEffect(() => {
        ReceiptsDrawer.show = show
        ReceiptsDrawer.hide = hide
        ReceiptsDrawer.setConfig = setConfig
        ReceiptsDrawer.afterConfirm = afterConfirm
    }, [])

    return (
        <Drawer
            title={config.title}
            visible={visible}
            width={598}
            bodyStyle={{padding: 0}}
            placement="right"
            onClose={hide}
            destroyOnClose
        >
            <CreateReceipt {...receiptsProps} />
        </Drawer>
    )
}

ReceiptsDrawer.show = receiptsProps => {
}
ReceiptsDrawer.hide = () => {
}
ReceiptsDrawer.setConfig = config => {
}
ReceiptsDrawer.afterConfirm = cb => {
}

// alias
export const receiptsDrawerHandler = ReceiptsDrawer

export const setupReceiptsDrawer = () => {
    // 通过多个独立的 ReactDOM.render 调用创建的组件默认不共享上下文
    if (window.__POWERED_BY_WUJIE__) {
        window.receiptsDrawerHandler = ReceiptsDrawer
    }
}
```

:::

### A，B 项目构造相同调用方式

```js
receiptsDrawerHandler.show({
    /** 业务参数 */
})

receiptsDrawerHandler.hide()

receiptsDrawerHandler.afterConfirm(data => {
})

receiptsDrawerHandler.setConfig({
    /** Drawer属性 */
})
```

## 参见

[微前端是什么 | 无界](https://wujie-micro.github.io/doc/guide/)
