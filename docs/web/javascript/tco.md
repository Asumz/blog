# 尾调用优化

## 什么是尾调用

"尾调用"（Tail call）的概念非常简单，一句话就能说清楚，就是指某个函数的最后一步是调用另一个函数。

```javascript
function f(x) {
    return g(x)
}
```

尾调用不一定出现在函数尾部，只要是最后一步操作即可。

```javascript
function f(x) {
    if (x > 0) {
        return m(x)
    }
    return n(x)
}
```

## 尾调用优化

我们知道，函数调用会在内存形成一个"调用记录"，又称"调用帧"（call frame），保存调用位置和内部变量等信息。

尾调用由于是函数的最后一步操作，所以不需要保留外层函数的调用记录，因为调用位置、内部变量等信息都不会再用到了，只要直接用内层函数的调用记录，取代外层函数的调用记录就可以了。

"尾调用优化"（Tail call optimization），即只保留内层函数的调用记录。如果所有函数都是尾调用，那么完全可以做到每次执行时，调用记录只有一项，这将大大节省内存。这就是"尾调用优化"的意义

## 尾递归

函数调用自身，称为递归。如果尾调用自身，就称为尾递归。

示例如下

```javascript
// 这是一个斐波那契数列函数
function fibonacci(n) {
    if (n < 0) throw new Error('输入的数字不能小于0')
    if (n == 1 || n == 2) {
        return 1
    } else {
        return fibonacci(n - 1) + fibonacci(n - 2)
    }
}
```

改为尾递归

```javascript
function fibonacci_tco(n, current = 0, next = 1) {
    if (n === 0) return 0
    if (n === 1) return next
    return fibonacci_tco(n - 1, next, current + next)
}
```

同等条件下递归测试

```javascript
const t0 = performance.now()

fibonacci(45)

const t1 = performance.now()

fibonacci_tco(45)

const t2 = performance.now()

console.log('fibonacci 函数执行了' + (t1 - t0) + '毫秒。')

console.log('fibonacci_tco 函数执行了' + (t2 - t1) + '毫秒。')
```

测试结果

```shell
fibonacci 函数执行了6835.158600002527毫秒。
fibonacci_tco 函数执行了0.18789999186992645毫秒。
```

由此可见，"尾调用优化"对递归操作意义重大，ES6 明确规定所有 ECMAScript 的实现，都必须部署"尾调用优化"。这就是说，在 ES6 中，只要使用尾递归，就不会发生栈溢出，相对节省内存。
