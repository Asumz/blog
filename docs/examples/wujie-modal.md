# Wujie 微前端项目主应用调用子应用弹窗

## 需求背景

业务需求为收款单表单页的改造，由单页面改为抽屉弹出。避免打开新页面跳转使用更快捷

## 方案分析

PC 项目是由[无界](https://wujie-micro.github.io/doc/guide/start.html)微前端搭建，主应用和子应用采用相同的技术栈 React Hooks，表单页是创建在子应用 B（财务系统）中的，且主应用 A（大风车 PC）和子应用 B 都有多处需要跳转表单页，且提交后有回调操作。

-   方案一：将表单页整体迁移到主应用中做成弹窗，通过无界`props`传递调用弹窗方法给子应用，优点为 1. 应用间通讯较为简单，2. 主应用始终存在，在子应用中可随时调用弹窗。考虑到页面业务逻辑太复杂（n 次迭代），迁移成本太大，且此处逻辑本就属于财务系统，遂取消~

-   方案二：直接在子应用 B 中将表单页改造为弹窗，通过无界`bus`事件满足主应用弹窗调用及回调需求。优点为没有业务迁移成本，只在原有基础上迭代业务即可，尽可能保留 Git 记录。最终采用此方案

:::warning 注意
主应用调用子应用方法时，子应用并非一直存在，需要提前创建实例
:::

## 方案可行性

### [iframe 连接机制和 css 沙箱机制](https://wujie-micro.github.io/doc/guide/#iframe-%E8%BF%9E%E6%8E%A5%E6%9C%BA%E5%88%B6%E5%92%8C-css-%E6%B2%99%E7%AE%B1%E6%9C%BA%E5%88%B6)

无界采用[webcomponent](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)来实现页面的样式隔离，无界会创建一个`<wujie>`自定义元素，然后将子应用的完整结构渲染在内部

子应用的实例 instance 在`iframe`内运行，dom 在主应用容器下的`webcomponent`内，通过代理 `iframe`的`document`到`webcomponent`，可以实现两者的互联。

:::info 提示
由于子应用是通过`webcomponent`渲染的，所以子应用弹窗可以突破页面限制，这一点`iframe`方案无法实现
:::

## 具体实现

### 主应用 A 代码

封装

```js
// src/hooks/useReceiptsDrawer.js;
import WujieReact from 'wujie-react'
import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import { F2ES_url_new } from '@/constants'

const { bus } = WujieReact

const origin = `${F2ES_url_new}/projects/Mars_WEB/mars-web-finance`

// 渲染一个空白子页面
const HiddenFinanceApp = ({ setReady }) => {
    return (
        // 禁止添加 display: none, overflow: hidden, visibility: hidden等属性
        // 会影响子应用弹窗及其嵌套的正常展示
        <div style={{ width: 0, height: 0 }}>
            <WujieReact
                width="0"
                height="0"
                name={'finance-blank'}
                url={`${origin}/#/blank`}
                afterMount={() => setReady(true)}
            />
        </div>
    )
}

export const useReceiptsDrawer = () => {
    // 判断实例准备好，可以调用子应用方法 Button.loading.disabled
    const [ready, setReady] = useState(false)

    useEffect(() => {
        let div = document.createElement('div')
        document.body.appendChild(div)
        ReactDom.render(<HiddenFinanceApp setReady={setReady} />, div)

        return () => {
            div.remove()
        }
    }, [])

    /**
     * ReceiptsDrawer参数
     * @typedef {Object} ReceiptsDrawerProps
     * @property {string} sourceCode - COLLECTION_ORDER | SALE_ORDER
     * @property {string} [associatedSourceId] - 关联销售订单ID
     * @property {string} [recordId] - 收款单ID
     * @property {string} createType - 创建方式 | 收款(receipt),退款(receiptBack)
     */

    /**
     *
     * @param {ReceiptsDrawerProps} data
     */
    const showReceiptsDrawer = data => {
        bus.$emit('showReceiptsDrawer', data)
    }

    const hideReceiptsDrawer = () => {
        bus.$emit('hideReceiptsDrawer')
    }

    /**
     * 监听“提交”
     * @param {(data: any) => void} cb
     */
    const afterReceiptsDrawerConfirm = cb => {
        bus.$once('afterReceiptsDrawerConfirm', cb)
    }

    return {
        ready: ready,
        show: showReceiptsDrawer,
        hide: hideReceiptsDrawer,
        afterConfirm: afterReceiptsDrawerConfirm,
    }
}
```

调用

```js
import { useReceiptsDrawer } from '@/components/hooks/useReceiptsDrawer'

const receiptsHandler = useReceiptsDrawer()

receiptsHandler.show({
    sourceCode: 'SALE_ORDER', // 收款单来源 COLLECTION_ORDER | SALE_ORDER
    associatedSourceId: 'W5OGfZGa2N', // 关联销售订单ID
    recordId: '', //收款单id 实际名sourceOrderId
    createType: 'createType', // 创建方式 | 收款(receipt),退款(receiptBack)
})

receiptsHandler.afterConfirm(data => {
    console.log('afterConfirm........', data)
})
```

### 子应用 B 代码

封装

```js
// src/components/ReceiptsDrawer/index.js;
import React, { useEffect, useState } from 'react'
import { Drawer } from 'antd'
import CreateReceipt from '@/pages/Receipt/CreateReceipt'
import eventBus, { eventBusCode } from '@/event-bus'

export const receiptsDrawerHandler = {
    show: receiptsProps => {},
    hide: () => {},
    setConfig: config => {},
    afterConfirm: () => {},
}

export const ReceiptsDrawer = () => {
    const [visible, setVisible] = useState(false)
    const [config, setConfig] = useState({})
    const [receiptsProps, setReceiptsProps] = useState({})

    const showDrawer = (receiptsProps = {}) => {
        setReceiptsProps(receiptsProps)
        setVisible(true)
    }

    const hideDrawer = () => {
        setVisible(false)
    }

    const afterConfirm = cb => {
        eventBus.on(eventBusCode.afterReceiptsDrawerConfirm, cb)
    }

    useEffect(() => {
        receiptsDrawerHandler.show = showDrawer
        receiptsDrawerHandler.hide = hideDrawer
        receiptsDrawerHandler.setConfig = setConfig
        receiptsDrawerHandler.afterConfirm = afterConfirm
    }, [])

    useEffect(() => {
        if (window.$wujie) {
            afterConfirm(data => {
                window.$wujie.bus.$emit(
                    eventBusCode.afterReceiptsDrawerConfirm,
                    data
                )
            })
        }
        return () => {
            eventBus.off(eventBusCode.afterReceiptsDrawerConfirm)
        }
    }, [])

    return (
        <Drawer
            title={config.title}
            visible={visible}
            width={598}
            bodyStyle={{ padding: 0 }}
            placement="right"
            onClose={hideDrawer}
            {...config}
        >
            <CreateReceipt {...receiptsProps} />
        </Drawer>
    )
}
```

```js
// src/components/ReceiptsDrawer/setup.js;
import { receiptsDrawerHandler, ReceiptsDrawer } from './index'
import React from 'react'
import ReactDom from 'react-dom'

export const setupReceiptsDrawer = () => {
    let div = document.createElement('div')
    document.body.appendChild(div)
    ReactDom.render(<ReceiptsDrawer />, div)

    if (window.$wujie) {
        window.$wujie.bus.$on('showReceiptsDrawer', receiptsProps => {
            console.log('receiptsProps', receiptsProps)
            receiptsDrawerHandler.show(receiptsProps)
        })
        window.$wujie.bus.$on('hideReceiptsDrawer', () => {
            receiptsDrawerHandler.hide()
        })
    }
}
```

```js
// src/app.js
import { setupReceiptsDrawer } from '@/components/ReceiptsDrawer/setup'

setupReceiptsDrawer()
```

调用

```js
import { receiptsDrawerHandler } from '@/components/ReceiptsDrawer'

receiptsDrawerHandler.show({
    sourceCode: 'SALE_ORDER', // COLLECTION_ORDER | SALE_ORDER
    associatedSourceId: 'W5OGfZGa2N', // 关联销售订单ID
    recordId: '6Dg7dqGE4b', //收款单id
    createType: 'createType', // 创建方式 | 收款(receipt),退款(receiptBack)
})

receiptsDrawerHandler.afterConfirm(data => {
    console.log('afterConfirm........', data)
})
```

## 参见

[微前端是什么|无界](https://wujie-micro.github.io/doc/guide/)
