# 无界微前端项目主应用调用子应用弹窗

## 需求背景

收款单表单页改造为抽屉弹出，避免打开新页面跳转使用更快捷

PC 项目是由[无界](https://wujie-micro.github.io/doc/guide/start.html)微前端搭建，主应用和子应用采用相同的技术栈
React，表单页是创建在子应用（财务系统）中的，且主应用和子应用都有多处需要跳转表单页，且提交后有回调操作。

## 方案分析

1. **业务迁移**：将收款单业务整体迁移到主应用，在主应用实现弹窗功能，并给子应用调用。 ❌
    - **优点**：基本没有技术瓶颈
    - **缺点**：业务很复杂，代码重构阻力大，且破坏了不同系统间的业务划分

2. **弹窗嵌入子页面**：不变动表单页，将子应用整页嵌入到主应用调起的抽屉弹窗留白处 ❌
    - **优点**：避免大量代码重构
    - **缺点**：子应用依赖主应用环境，无法独立开发调试

3. **主应用调用子应用方法**：直接在子应用中挂载全局弹窗实例，通过无界通信让主应用调用 ✅
    - **优点**：避免大量代码重构
    - **优点**：子应用可以独立开发调试
    - **缺点**：子应用尚未挂载前（隐式渲染），弹窗按钮需等待2s左右（首次创建应用实例费时）

## 需考虑问题

1. 子应用被隐式渲染（宽高为0的空白页路由），调用方法后右侧抽屉能否正常展示出来？
    - 可以的，无界并非采用iframe渲染页面。[无界实现原理](https://wujie-micro.github.io/doc/guide/#iframe-%E8%BF%9E%E6%8E%A5%E6%9C%BA%E5%88%B6%E5%92%8C-css-%E6%B2%99%E7%AE%B1%E6%9C%BA%E5%88%B6)

2. 右侧抽屉中会有确认弹窗居中在整个屏幕，跑出了抽屉的范围能否正常展示？
    - 可以的，和问题1本质一样

3. 无界通信方案选择？
    - `bus` 通信：实际项目中发现主应用会同时创建多个子应用实例（先前业务不赘述），产生了通信广播的问题，导致一次点击同时弹起多个弹窗，确认多次回调的问题
      ❌
    - `window`通信：主应用获取单个子应用实例，单点通信 ✅

4. 全局弹窗如何封装设计？
    - 保持父子应用间的接口一致
    - 弹窗因为具备业务属性，创建在 `<App/>` 下，为了共享上下文和属性传递
    - 主应用封装的hook，应用在class组件需要构造一个HOC嵌套一下

5. 子应用实例尚未加载完成前，如何处理可能遇到的实例方法为undefined？
    - 通过无界生命周期获取子应用状态，在子应用渲染完成前，以弹窗按钮loading的形式告知用户

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
