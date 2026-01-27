<script lang="ts" setup>
import { computed, provide, reactive, ref, useTemplateRef, watch } from 'vue';
import type { CSSProperties } from 'vue';
import { useDebounceFn, useResizeObserver } from "@vueuse/core";
type ColCount = number;
type Item = Record<string, any>;
/**
 * @member x 第几列 
 * @member y 高度，单位是px
 */
interface ItemPos {
  x: number;
  y: number;
}
function toCss(obj: Record<string, any>, forceCustomName: boolean = false): CSSProperties {
  const prevReg = forceCustomName ? /^([A-Za-z])/ : /^([A-Z])/;
  return Object.keys(obj)
    .map((k) => ({ [k.replace(prevReg, "--$1").replace(/\B([A-Z])/g, "-$1").toLowerCase()]: obj[k] }))
    .reduce((o, p) => Object.assign(o, p), {})
}
interface Props {
  list: Item[];
  breakPoint: (wapperWidth: number) => ColCount;
  rowKey: (element: Item) => PropertyKey;
  transition: number;
  joinDuration: number;
  animate: string;
}
const props = withDefaults(defineProps<Props>(), {
  list: () => [],
  breakPoint: (w: number) => Math.floor(w / 200),
  rowKey: (e: Item | { id: PropertyKey }): PropertyKey => e.id,
  transition: 300,
  joinDuration: 300,
  animate: "fade-in"
});
const wtfElement = useTemplateRef('wtfElement');
const wapperWidth = ref<number>(0);
const borderOffset = reactive({ WtfOffsetX: 0, WtfOffsetY: 0, });
useResizeObserver(wtfElement, ([entry]) => {
  const { width, top, left } = entry.contentRect;
  borderOffset.WtfOffsetX = left;
  borderOffset.WtfOffsetY = top;
  wapperWidth.value = width;
})
// 有几列(桶)
const colCount = computed(() => Math.max(1, props.breakPoint(wapperWidth.value)));
// 列(桶)宽
const itemFlexWidth = computed(() => Math.floor(wapperWidth.value / colCount.value));
// 所有item高度表
function getItemHeights() {
  return props.list.map((_, i) => wtfElement.value?.children[i]?.getBoundingClientRect().height ?? 1 << 28).map(n => Math.round(n));
}
// 位置表
const itemPosList = reactive<WeakMap<Item, ItemPos>>(new WeakMap());
// waterfall容器 高度
const wapperHeight = ref(0);
// waterfall容器style
const wtfCss = computed<CSSProperties>(() => ({
  height: `${wapperHeight.value}px`,
  ...toCss({
    WtfItemWidth: itemFlexWidth.value,
    WtfTransition: props.transition,
    WtfJoinDuration: props.joinDuration,
    ...borderOffset
  }),
}))
const listed = reactive<WeakSet<Item>>(new WeakSet());
// 计算所有item位置
function render() {
  if (!wapperWidth.value) {
    return;
  }
  // 列(桶)高度
  const bucketHeights = Array.from<number>({ length: colCount.value }).fill(0);
  // itemPosList.splice(0);
  const heights = getItemHeights();
  heights.forEach((itemHeight, index) => {
    // 当前最短的列(桶)
    const minBuckIndex = bucketHeights.reduce((pv, v, i, arr) => arr[pv] > v ? i : pv, 0);
    itemPosList.set(props.list[index], { x: minBuckIndex, y: bucketHeights[minBuckIndex] })
    bucketHeights[minBuckIndex] += itemHeight;
  });
  wapperHeight.value = Math.max(...bucketHeights) + borderOffset.WtfOffsetY;
  setTimeout(() => {
    props.list.forEach((e, i) => {
      listed.add(e);
    });
  }, Math.max(20, props.transition));
}
// 防抖
const rerender = useDebounceFn(render, () => 100);
// 提供给子组件的重排接口
provide("imgLoaded", rerender);
watch([colCount, wapperWidth, () => props.list], () => {
  rerender();
}, { deep: true, immediate: false });
function cssPos(item: Item): CSSProperties {
  const { x, y } = itemPosList.get(item) ?? { x: 0, y: 9000 };
  return toCss({ WtfX: x, WtfY: y });
}
function joined(item: Item): boolean {
  return listed.has(item);
}
// 仅暴露重排函数
defineExpose<{ rerender: () => void }>({ rerender });

</script>
<template>
  <div class="waterfall-list" :style="wtfCss" ref="wtfElement">
    <div v-for="(item, index) in list" class="waterfall-item" :class="[animate]"
      :before-render="!joined(item) || void 0" :key="rowKey(item) ?? index" :style="cssPos(item)">
      <slot :="{ item, index }"></slot>
    </div>
  </div>
</template>
<style lang="less">
:root {
  --wtf-item-width: 0;
  --wtf-x: 0;
  --wtf-y: 9000;
  --wtf-transition: 300;
  --wtf-join-duration: 1000;
}

.waterfall-list {
  position: relative !important;
  overflow: hidden;
  // width: 100%;

  --transition-ms: calc(var(--wtf-transition) * 1ms);
  --join-duration-ms: calc(var(--wtf-join-duration) * 1ms);

  >.waterfall-item {
    position: absolute !important;
    width: calc(var(--wtf-item-width) * 1px) !important;
    box-sizing: content-box !important;

    left: calc(calc(calc(var(--wtf-item-width) * var(--wtf-x)) + var(--wtf-offset-x)) * 1px);
    top: calc(calc(var(--wtf-y) + var(--wtf-offset-y)) * 1px);

    animation-duration: var(--join-duration-ms);

    &:not([before-render]) {
      transition: top var(--transition-ms), left var(--transition-ms);
    }

    &[before-render] {
      visibility: hidden;
      transition: none;
    }
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

*:not([before-render]) {

  &.fade-in {
    animation-name: fade-in;
  }

  &.fade-up {
    animation-name: fade-up;
  }
}
</style>