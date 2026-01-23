# 无界微前端构建跨应用弹窗

## 需求背景

子应用中的收款单表单页改造（页面 -> 抽屉），且抽屉需要**跨应用被全局调用**

项目是由[无界](https://wujie-micro.github.io/doc/guide/start.html)微前端搭建，主应用和子应用均采用React + Antd技术栈。

## 技术方案对比

| 方案名称       | 实现方式                    | 优势                             | 劣势               |
|------------|-------------------------|--------------------------------|------------------|
| 主应用弹窗      | 将收款单业务完整迁移至主应用，封装成业务型弹窗 | • 技术实现简单                       | • 重构量大<br>• 业务混淆 |
| 主应用弹窗嵌入子应用 | 将子应用页面嵌入主应用弹窗容器         | • 重构量小<br>• 业务解耦               | • 子应用无法独立开发调试弹窗  |
| ✅子应用弹窗     | 后台创建子应用实例，由子应用提供弹窗方法    | • 重构量小<br>• 业务解耦<br>• 独立调试<br> | /                |

## 关键技术问题

### 1. 弹窗怎么穿透窗口？

无界采用 `Web Components` 渲染应用，没有 `iframe`
方案的顾虑。[无界实现原理](https://wujie-micro.github.io/doc/guide/#iframe-%E8%BF%9E%E6%8E%A5%E6%9C%BA%E5%88%B6%E5%92%8C-css-%E6%B2%99%E7%AE%B1%E6%9C%BA%E5%88%B6)

### 2. 多弹窗层级怎么控制？

首先，由于无界的渲染方案，父子应用在同一项目中，弹窗层级会遵循整个渲染页面中**一致的z-index规则！**。

1. 父子应用都弹窗，父应用的弹窗元素会在body中更靠后，会产生如果父子弹窗z-index都为1000，子应用弹窗始终会被遮蔽的效果。因此子应用弹窗需要设置更高的层级
2. 同一应用中的多弹窗依赖 antd 本身的弹窗调度

### 3. 无界通信方案选择？

因受业务限制放弃 bus 通信（广播问题）采用 window 单点通信，挂载实例到 window 时仍需鉴权

### 4. 弹窗封装设计细节？

1. 弹窗因为具备业务属性，需要确保 `context` 完整传递，不能作为独立组件树构建
2. 主应用需要为弹窗 hooks 创建 HOC 兼容 class 组件

### 5. 子应用未准备好时弹窗无法调起怎么处理？

监听无界钩子关联到子应用的生命周期状态。子应用 `mounted` 之前按钮显示 loading

## 具体实现

### 主应用代码

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

:::details HOC 实现

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

:::

### 子应用代码

:::details 构建全局弹窗

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

### 父子项目构造相同调用方式

:::details 弹窗调用

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

:::