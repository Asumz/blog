# 实现一个 cloneDeep 函数

:::warning 注意
JSON 方法无法拷贝循环引用的对象，我们需要做到这点
:::

## 具体实现

```js{7}
/**
 * 深度克隆函数
 * @param {*} obj - 需要克隆的对象
 * @returns {*} - 克隆后的对象
 */
function cloneDeep(obj) {
    let cache = new Map() // 创建一个缓存对象，用于存储已克隆的对象，解决循环引用

    function clone(obj, cache) {
        if (typeof obj !== 'object' || obj === null) {
            return obj
        }

        if (cache.has(obj)) {
            return cache.get(obj)
        } else {
            cache.set(obj, obj)
        }

        if (Array.isArray(obj)) {
            let cloneArray = []
            obj.forEach(item => {
                cloneArray.push(clone(item, cache))
            })
            return cloneArray
        } else {
            let cloneObject = {}
            for (let key in obj) {
                cloneObject[key] = clone(obj[key], cache)
            }
            return cloneObject
        }
    }

    let result = clone(obj, cache)
    return result
}
```
