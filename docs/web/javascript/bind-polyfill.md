# 实现一个 bind 函数

:::warning 注意
new 操作符优先级大于 bind 绑定，因此实现过程中可以修改 bound 函数内的 this 指向
:::

## polyfill

```js {21}
/** 该辅助函数中 new 操作符的调用无法修改 this 绑定 */
// function bind(fn, context) {
//     return function () {
//         return fn.apply(context, arguments)
//     }
// }

Function.prototype._bind = function (oThis) {
    if (typeof this !== 'function') {
        throw new TypeError(
            'Function.prototype.bind - what is trying' +
                'to be bound is not callable'
        )
    }
    var aArgs = Array.prototype.slice.call(arguments, 1),
        fTobind = this,
        fNOP = function () {}, // 空操作指令
        fBound = function () {
            return fTobind.apply(
                /** new -> fBoundInstance */
                this instanceof fNOP && oThis ? this : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments))
            )
        }

    fNOP.prototype = this.prototype
    fBound.prototype = new fNOP()

    return fBound
}
```

优先级测试

```js
function foo(something) {
    this.a = something
}

var obj1 = {}

var bar = foo._bind(obj1)
bar(2)
console.log(obj1.a) // 2

var baz = new bar(3)
console.log(obj1.a) // 2
console.log(baz.a) // 3
```
