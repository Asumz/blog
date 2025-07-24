# 有滚动容器的情形下吸附至吸附点

## 滑动试试...

<div :class="$style.container">
    <div :class="$style.box1">1</div>
    <div :class="$style.box2">2</div>
    <div :class="$style.box3">3</div>
</div>

<style module>
.container {
    width: 20rem;
    height: 20rem;
    background-color: white;
    display: flex;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
}
.container > div {
    min-width: 20rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10rem;
    color: white;
    scroll-snap-align: center;
}
.box1 {
    background-color: #faa;
}
.box2 {
    background-color: #afa;
}
.box3 {
    background-color: #aaf;
}
</style>
