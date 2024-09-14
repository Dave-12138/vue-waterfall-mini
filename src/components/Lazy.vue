<script>

import { ref, onMounted, inject } from 'vue';
function loadElement(el) {
    el.loadme?.();
    observer.unobserve(el);
}

const observer = new IntersectionObserver(function (entries) {
    for (let i = 0; i < entries.length; i++) {
        const item = entries[i];
        if (item.isIntersecting) {
            loadElement(item.target);
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
        const beforeLoadStyles = {
            backgroundImage: "var(--loading)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "100%",
            height: 0,
            paddingBottom: "75%"
        }
        return { iref, onload, loading, beforeLoadStyles };
    }
}
</script>
<template>
    <img v-if="loading" v-bind="$attrs" :class="{ loading: loading != 2 }"
        :style="[loading != 2 ? beforeLoadStyles : {}]" :src="src" @load="onload">
    <div v-else v-bind="$attrs" :style="beforeLoadStyles" class="before-lazy" ref="iref"></div>
</template>
<style>
:root {
    --loading: url("data:image/svg+xml,%3Csvg width='128' height='109' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext stroke='%23000' font-family='Noto Sans JP' font-size='24' y='42' x='21' stroke-width='0' fill='%23666'%3ELoading%3C/text%3E%3Ctext font-family='Noto Sans JP' font-size='24' y='87' x='30' stroke-width='0' stroke='%23000' fill='%23666'%3E加载中%3C/text%3E%3C/svg%3E");
}
</style>