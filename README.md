# vue-waterfall-mini

简单的vue3瀑布流组件，通过vue调整元素样式而非直接进行dom操作以获得最好的兼容性。

## 安装

```cmd
npm i vue-waterfall-mini
```

## 使用例
[在线示例](https://dave-12138.github.io/vue-waterfall-mini/)
```javascript
import { Waterfall } from "vue-waterfall-mini";
import "vue-waterfall-mini/style";
export default {
    components: {
        Waterfall
    },
    setup() {
        const items = reactive([]);

        function getItems() {
            // some code...
        }
        return {
            items
        }
    }
}
```

```HTML
<Waterfall :list="items" :row-key="im=>im.hash" :break-point="w => w > 992?4:2" animate="fade-up" join-duration="1000">
    <!-- 瀑布流中的元素容器，下称“卡片” -->
    <!-- “#=” 是 v-slot= 的简写，而 v-slot= 会被vue解释为 v-slot:default= -->
    <template #="{ item, index }">
        <!-- 每个卡片的内容物，下称“卡片内容” -->
        <table class="table table-striped table-hover">
            <tr v-for="val, key in item">
                <td>{{ key }}</td>
                <td>{{ val }}</td>
            </tr>
        </table>
    </template>
</Waterfall>
```

由于只有一个default插槽，你可以省略 template ，就像这样：

```HTML
<Waterfall :list="items" #="{ item, index }">
    <div>{{ item.name }}</div>
</Waterfall>
```

## 组件props

参数名|类型|默认值|注释
-|-|-|-
list|Array|[]|瀑布流中元素的集合，瀑布流依据它生成卡片列表
`break-point` | `(wapperWidth: number) => number` | `w=>Math.floor(w/200)` |控制当瀑布流容器宽度为 `wapperWidth` （单位：px）时，瀑布流的列数的函数<br/>默认值下，容器每有 200px 宽则增加一列<br/>若希望容器宽度 > 992px 时呈现 3 列，否则呈现 1 列时可以使用 `w=>w>992?3:1`
`row-key` | ` (element) => string \| number \| symbol` | `e => e.id ` |获取列表元素 `key` 的函数，默认获取字段 `id`<br/>**未能获取唯一key时自动使用数组下标作为识别符，这会导致动画效果些微抽搐**
`transition` | `number` |300|瀑布流中卡片重新排列位置的“重排动画”持续时间，单位毫秒，理论上设为 0 就可以关闭重排动画了
`join-duration` | `number` |300|新加入卡片的“加入动画”持续时间，单位毫秒
`animate` | `string` |fade-in|新加入卡片的“加入动画”，传递的参数的同名 class 会被添加给卡片 <br/>组件预提供 fade-in 和 fade-up 两种动画

## 动画

默认动画fade-in:

```css
@keyframes fade-in {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.fade-in:not([before-render]) {
    animation-name: fade-in;
}
```

瀑布流中所有元素在创建时会得到 animate 参数同名 class 和 before-render 属性，此时元素不可见。

而后元素被计算好位置并去除 before-render 属性，此时元素可见，因此 `.fade-in:not([before-render])` 意味着在 before-render 属性被去除时开始动画。

## 触发重新排列
组件会在列数变化、容器宽度变化、list内容增减或修改时尝试重新排列。

但组件无法侦测到卡片内容中图片加载的大小变化时机，因此本组件使用依赖注入暴露重新渲染函数。

你可以在插槽内的子组件中使用 `inject("imgLoaded")` 获取该函数。
``` JavaScript
const rerender = inject("imgLoaded");
```
``` HTML
<img src="..." @load="rerender">
```
当然，考虑到您可能不想把卡片内容做成独立组件，更不想舍近求远使用`:ref="(w) => rerender = w.$.provides.rerender"`，本组件暴露了重排函数：

``` HTML
<!-- 可以用解包 ，写成  :ref="({ rerender: r }) => rerender = r" -->
<Waterfall :list="items" #="{ item, index }" :ref="(wtf) => rerender = wtf.rerender">
    <img src="..." @load="rerender">
</Waterfall>
```
``` JavaScript
const rerender = ref(()=>{});
```


## 卡片宽度、间隙与容器边框

卡片宽度会弹性增长到 容器内宽 ➗ 列数。

卡片之间的实际间隙固定为 0 无法调整，你可以调整卡片之间的视觉间隙。通过调整卡片内容的 margin 样式可以轻松调整卡片上下左右的视觉间隙。

可以通过调整瀑布流容器上、左、右的 padding 样式调整瀑布流容器内容（那些卡片）与容器边界的间距。你可以直接给 Waterfall 组件添加 style 或 class 来实现这一点。
- 当瀑布流容器样式使用 `box-sizing: content-box` 时，下边距会增大，增大值等于上边距（padding）。
- 当瀑布流容器样式使用 `box-sizing: border-box` 时，下边距无视padding设置，固定为0。请使用 margin 代替。
