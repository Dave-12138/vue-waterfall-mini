<script lang="ts">
import { computed, defineComponent, provide, reactive, ref, watch } from 'vue';
import type { PropType, CSSProperties } from 'vue';
import { useDebounceFn, useResizeObserver } from "@vueuse/core";
type ColCount = number;
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
type Item = Record<string, any>;
export default defineComponent({
  props: {
    list: {
      type: Array as PropType<Item[]>,
      default: () => []
    },
    breakPoint: {
      type: Function as PropType<(wapperWidth: number) => ColCount>,
      default: (w: number) => Math.floor(w / 200)
    },
    rowKey: {
      type: Function as PropType<(element: Item) => PropertyKey>,
      default: (e: { id: string }) => e.id
    },
    transition: {
      type: Number,
      default: 300
    },
    joinDuration: {
      type: Number,
      default: 300
    },
    animate: {
      type: String,
      default: "fade-in"
    }
  },
  setup(props, { expose }) {
    const wtfElement = ref<HTMLDivElement | null>(null);
    const wapperWidth = ref<number>(0);
    const borderOffset = reactive({ OffsetX: 0, OffsetY: 0, });
    useResizeObserver(wtfElement, ([entry]) => {
      const { width, top, left } = entry.contentRect;
      borderOffset.OffsetX = left;
      borderOffset.OffsetY = top;
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
    const itemPosList = reactive<Record<string, ItemPos>>({});
    // waterfall容器 高度
    const wapperHeight = ref(0);
    // waterfall容器style
    const wtfCss = computed<CSSProperties>(() => ({
      height: `${wapperHeight.value}px`,
      ...toCss({
        ItemWidth: itemFlexWidth.value,
        Transition: props.transition,
        JoinDuration: props.joinDuration,
        ...borderOffset
      }),
    }))
    const listed = reactive<Record<string, boolean>>({});
    /**
     * Get String Key 获取key，但是string
     * @param item 
     */
    function gsk(item: Item): string {
      return props.rowKey(item)?.toString() ?? props.list.indexOf(item).toString();
    }
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
        itemPosList[gsk(props.list[index])] = ({ x: minBuckIndex, y: bucketHeights[minBuckIndex] });
        bucketHeights[minBuckIndex] += itemHeight;
      });
      wapperHeight.value = Math.max(...bucketHeights) + borderOffset.OffsetY;
      setTimeout(() => {
        props.list.forEach((e, i) => {
          listed[gsk(e)] = true;
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
      const { x, y } = itemPosList[gsk(item)] ?? { x: 0, y: 9000 };
      return toCss({ x, y }, true);
    }
    function joined(item: Item): boolean {
      return listed[gsk(item)] === true;
    }
    // 仅暴露重排函数
    expose<{ rerender: () => void }>({ rerender });

    return { wtfElement, wtfCss, cssPos, joined };
  }
})
</script>
<template>
  <div class="waterfall-list" :style="wtfCss" ref="wtfElement">
    <div v-for="(item, index) in list" class="waterfall-item" :class="[animate]"
      :before-render="joined(item) ? void 0 : true" :key="rowKey(item) ?? index" :style="cssPos(item)">
      <slot :="{ item, index }"></slot>
    </div>
  </div>
</template>
<style lang="less">
:root {
  --item-width: 0;
  --x: 0;
  --y: 9000;
  --transition: 300;
  --join-duration: 1000;
}

.waterfall-list {
  position: relative !important;
  overflow: hidden;
  // width: 100%;

  --transition-ms: calc(var(--transition) * 1ms);
  --join-duration-ms: calc(var(--join-duration) * 1ms);

  >.waterfall-item {
    position: absolute !important;
    width: calc(var(--item-width) * 1px) !important;
    box-sizing: content-box !important;

    left: calc(calc(calc(var(--item-width) * var(--x)) + var(--offset-x)) * 1px);
    top: calc(calc(var(--y) + var(--offset-y)) * 1px);

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