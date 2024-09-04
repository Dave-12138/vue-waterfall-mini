<script lang="ts">
import { computed, defineComponent, nextTick, provide, reactive, ref, watch } from 'vue';
import type { PropType } from 'vue';
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
interface CssItemPos extends Record<string, number> {
  '--x': number;
  '--y': number;
}
export default defineComponent({
  props: {
    list: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => []
    },
    breakPoint: {
      type: Function as PropType<(wapperWidth: number) => ColCount>,
      default: (w: number) => Math.floor(w / 200)
    },
    rowKey: {
      type: Function as PropType<(element: Record<string, any>) => PropertyKey>,
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
  setup(props) {
    const wtfElement = ref<HTMLDivElement | null>(null);
    const wapperWidth = ref<number>(0);
    const borderOffset = reactive({ left: 0, top: 0, });
    useResizeObserver(wtfElement, ([entry]) => {
      const { width, top, left } = entry.contentRect;
      borderOffset.left = left;
      borderOffset.top = top;
      wapperWidth.value = width;
      console.info(entry.contentRect.toJSON());
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
    const itemPosList = reactive<ItemPos[]>([]);
    // waterfall容器 高度
    const wapperHeight = ref(0);
    // waterfall容器style
    const wtfCss = computed(() => ({
      height: `${wapperHeight.value}px`,
      '--item-width': itemFlexWidth.value,
      '--transition': props.transition,
      '--join-duration': props.joinDuration,
      '--offset-x': borderOffset.left,
      '--offset-y': borderOffset.top,
    }))
    const listed = reactive<PropertyKey[]>([]);
    // 计算所有item位置
    async function render() {
      if (!wtfElement.value) {
        return;
      }
      // 列(桶)高度
      const bucketHeights: Array<number> = Array.from<number>({ length: colCount.value }).fill(0);
      itemPosList.splice(0);
      const heights = getItemHeights();
      heights.forEach((itemHeight, index) => {
        // 当前最短的列(桶)
        const minBuckIndex = bucketHeights.reduce((pv, v, i, arr) => arr[pv] > v ? i : pv, 0);
        itemPosList[index] = ({ x: minBuckIndex, y: bucketHeights[minBuckIndex] });
        bucketHeights[minBuckIndex] += itemHeight;
      })
      wapperHeight.value = Math.max(...bucketHeights) + borderOffset.top;
      setTimeout(() => {
        props.list.forEach((e, i) => {
          listed[i] = props.rowKey(e);
        });
      }, Math.max(20, props.transition));
    }
    // 防抖
    const rerender = useDebounceFn(render, () => props.transition);
    // 提供给子组件的重排接口
    provide("imgLoaded", rerender);
    watch([colCount, wapperWidth, () => props.list], () => {
      nextTick().then(rerender);
    }, { deep: true, immediate: false });
    function cssPos(itemIndex: number): CssItemPos {
      const { x, y } = itemPosList[itemIndex] ?? { x: 0, y: 9000 };
      return { '--x': x, '--y': y };
    }
    function joined(itemIndex: number): boolean {
      const k = props.rowKey(props.list[itemIndex]);
      return listed[itemIndex] === k || listed.includes(k);
    }
    return { wtfElement, wtfCss, cssPos, joined }
  }
})
</script>
<template>
  <div class="waterfall-list" :style="wtfCss" ref="wtfElement">
    <div v-for="(item, index) in list" class="waterfall-item" :class="[animate]"
      :before-render="joined(index) ? void 0 : true" :key="rowKey(item) ?? item.id" :style="cssPos(index)">
      <slot :="{ item, index }"></slot>
    </div>
  </div>
</template>
<style lang="less">
:root {
  --item-width: 200;
  --x: 0;
  --y: 9000;
  --transition: 300;
  --join-duration: 1000;
}

.waterfall-list {
  position: relative;
  overflow: hidden;
  width: 100%;

  --transition-ms: calc(var(--transition) * 1ms);
  --join-duration-ms: calc(var(--join-duration) * 1ms);

  >.waterfall-item {
    position: absolute;
    width: calc(var(--item-width) * 1px);
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