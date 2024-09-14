<script>
import { ref, onMounted, inject, computed } from 'vue';
const observer = new IntersectionObserver(function (entries, observer) {
    for (let i = 0; i < entries.length; i++) {
        const item = entries[i];
        if (item.isIntersecting) {
            item.target.loadme?.();
            observer.unobserve(item.target);
        }
    }
});
export default {
    props: ['src'],
    setup(props, { expose }) {
        const iref = ref(null);
        const imgLoaded = inject('imgLoaded');
        const loading = ref(0);
        function loadme() {
            loading.value = 1;
        }
        function onload() {
            imgLoaded?.();
            loading.value = 2;
        }
        onMounted(() => {
            iref.value.loadme = loadme;
            observer.observe(iref.value);
        });
        expose();
        const styles = computed(() => loading.value == 2 ? {} : {
            backgroundImage: "var(--loading)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "100%",
            height: 0,
            paddingBottom: "75%"
        })
        return { iref, onload, loading, styles };
    }
}
</script>
<template>
    <img v-if="loading" v-bind="$attrs" :class="{ loading: loading != 2 }" :style="styles" :src="src" @load="onload">
    <div v-else v-bind="$attrs" :style="styles" class="before-lazy" ref="iref"></div>
</template>
<style>
:root {
    --loading: url("data:image/svg+xml,%3Csvg width='128' height='109' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext stroke='%23000' font-family='Noto Sans JP' font-size='24' y='42' x='21' stroke-width='0' fill='%23666'%3ELoading%3C/text%3E%3Ctext font-family='Noto Sans JP' font-size='24' y='87' x='30' stroke-width='0' stroke='%23000' fill='%23666'%3E加载中%3C/text%3E%3C/svg%3E");
}
</style>