# 无界微前端项目主应用调用子应用弹窗

## 需求背景

收款单表单页改造为抽屉弹出，避免打开新页面跳转使用更快捷

PC 项目是由[无界](https://wujie-micro.github.io/doc/guide/start.html)微前端搭建，主应用和子应用采用相同的技术栈
React，表单页是创建在子应用（财务系统）中的，且主应用和子应用都有多处需要跳转表单页，且提交后有回调操作。

## 方案分析

- 方案 1：将收款单业务整体迁移到主应用，在主应用实现弹窗功能，并给子应用调用。 ❌
    - **优点**：代码逻辑简单，只需要通过无界通信即可
    - **缺点**：业务逻辑太复杂，迁移成本大，且破坏了不同系统间的业务划分
    - **缺点**：业务代码Git 记录被严重破坏，难以追查

- 方案 2：不变动表单页，将子应用整页嵌入到主应用调起的抽屉弹窗留白处 ❌
    - **优点**：不需要做业务代码的迁移
    - **缺点**：（猜测阶段，无界原理并非如此）右侧的抽屉页面，再次调起居中的弹窗，无法突破iframe窗口限制
    - **缺点**：依旧需要主应用套壳（抽屉）实现，强依赖主应用环境，导致子应用无法独立调试

- 方案 3：（调研无界原理后）直接在子应用中设计弹窗套壳表单页，并封装弹窗实例方法，通过无界通信，主应用直接调用 ✅
    - **优点**：不需要做业务代码的迁移
    - **优点**：可以独立调试，可以给任意应用调用，灵活性高
    - **缺点**：弹窗实例挂载到 window 全局污染

> 方案3中的通信方案选择
> 1. 采用无界事件 `bus` 通信。落地中发现主项目可能会同时创建多个子应用实例（先前业务导致不赘述），产生了通信广播的问题，导致一次点击同时弹起多个弹窗，确认多次回调的问题，不好解决
     ❌
> 2. 采用`window`通信。在子应用中将弹窗实例挂载到 window 上，主应用获取某个子应用 window，实现一对一通信 ✅

:::tip 方案 3
主应用调用子应用方法时，子应用并非一直存在，需要隐式创建实例并等待
:::

## 无界原理调研

### [iframe 连接机制和 css 沙箱机制](https://wujie-micro.github.io/doc/guide/#iframe-%E8%BF%9E%E6%8E%A5%E6%9C%BA%E5%88%B6%E5%92%8C-css-%E6%B2%99%E7%AE%B1%E6%9C%BA%E5%88%B6)

无界采用[web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)来实现页面的样式隔离，无界会创建一个
`<wujie>`自定义元素，然后将子应用的完整结构渲染在内部

子应用的实例 instance 在`iframe`内运行，dom 在主应用容器下的`webcomponent`内，通过代理 `iframe`的`document`到
`webcomponent`，可以实现两者的互联。

:::tip 提示
由于子应用是通过`webcomponent`渲染的，子应用弹窗可以突破页面限制

所以该实现方案限制无界难以由`webcomponent`降级到`iframe`
:::

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
