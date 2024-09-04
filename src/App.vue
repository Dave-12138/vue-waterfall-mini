<script setup lang="ts">
import { defineAsyncComponent, reactive, } from 'vue';
import { Waterfall } from './main';
import BSInput from './components/BSInput.vue';
import { json } from 'stream/consumers';
const c = Array.from<string>("0123456789ABCDEF")
const d = () => c[(c.length * Math.random()) | 0]
const _createItem = () => ({ id: crypto.randomUUID(), h: 3 + (Math.random() * 30) | 0, c: '#' + d() + d() + d() });
const createItem = () => {
    const e = _createItem();
    try {
        settings.itemModify(e);
    } catch (_) { }
    return e;
}
const list = reactive<Record<string, any>[]>([...Array.from({ length: 6 }).map(createItem)]);
async function push(count: number = 1) {
    list.push(...Array.from({ length: Math.floor(count) }).map(createItem));
    await sleep(3000);
}
function sleep(ms: number = 1000) {
    return new Promise<void>(r => {
        setTimeout(() => r(), ms);
    });
}
sleep().then(async () => {
    while (true) {
        if (list.length < settings.maxCount) push(Math.random() * (settings.maxAdd - settings.minAdd) + settings.minAdd);
        await sleep(settings.addDelay);
    }
});
const props = reactive({
    transition: 300,
    joinDuration: 1000,
    animate: 'fade-in',
    breakPoint: (x: number) => Math.floor(x / 200),
    rowKey: (f: Record<string, any>) => f.id
});
const settings = reactive({
    itemModify: (e: any) => { },
    key1: "h",
    key2: "c",
    addDelay: 3000,
    minAdd: 1,
    maxAdd: 5,
    maxCount: 20
});
</script>
<template>
    <div class="container">
        <div class="m-5">
            <div class="alert alert-success">Waterfall props</div>
            <BSInput type="number" min="0" step="1" v-model="props.transition">transition</BSInput>
            <BSInput type="number" min="0" step="1" v-model="props.joinDuration">join-duration</BSInput>
            <BSInput type="text" v-model="props.animate" list="animates">animate</BSInput>
            <datalist id="animates">
                <option value="fade-in"></option>
                <option value="fade-up"></option>
                <option value="fade-rotate"></option>
            </datalist>
            <BSInput type="function" v-model="props.breakPoint">breakPoint</BSInput>
            <BSInput type="function" v-model="props.rowKey">rowKey</BSInput>
        </div>
        <div class="m-5">
            <div class="alert alert-warning">演示工具</div>
            <BSInput type="text" :value="JSON.stringify(list[0])" disabled>list[0]</BSInput>
            <BSInput type="function" v-model="settings.itemModify">你可以调整演示item对象</BSInput>
            <BSInput type="text" v-model="settings.key1">item上的文字(大)</BSInput>
            <BSInput type="text" v-model="settings.key2">item上的文字(小，可以是html)</BSInput>
            <div class="input-group">
                <BSInput type="number" min="0" step="1" v-model="settings.addDelay">每</BSInput>
                <BSInput type="number" min="0" step="1" v-model="settings.minAdd">毫秒增加</BSInput>
                <BSInput type="number" min="0" step="1" v-model="settings.maxAdd">~</BSInput>
                <BSInput type="number" min="0" step="1" v-model="settings.maxCount">个新元素，直到个数达到</BSInput>
            </div>
            <button class="btn btn-outline-danger" @click="list.splice(0)">清空item</button>
        </div>

    </div>
    <div class=" container">
        <Waterfall :list="list" #="{ item, index }" :="props">
            <div class="my-item" @click="list.splice(index, 1)" :style="{ backgroundColor: item.c }">
                <div :style="{ height: item.h + 'rem' }">
                    <div>{{ item[settings.key1] }}</div>
                    <div v-html="item[settings.key2]"></div>
                </div>
            </div>
        </Waterfall>
    </div>
</template>
<style lang="less" scoped>
@import 'https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.1/css/bootstrap.min.css';

.input-group>.input-group {
    width: auto;
}

.x1 {
    width: 70%;
    margin: 0 auto;
    overflow: hidden;
    box-sizing: border-box;
}

.my-item {
    background-color: rgb(58, 145, 94);
    border-radius: 1.5rem;
    overflow: hidden;
    margin: .5rem;

    >div {
        // background-color: brown;
        min-height: 1rem;
        position: relative;

        >div {
            position: absolute;
            left: 50%;

            transform: translate(-50%, -50%);

            &:first-child {
                top: 50%;
                user-select: none;
                font-size: 4rem;
            }

            &:last-child {
                transform: translate(-50%, 0);
                bottom: 0;
            }
        }
    }
}

.waterfall-list {
    background-color: rgb(52, 66, 66);
    // margin: 2rem;
    padding: 3rem 3rem 1rem;
    box-sizing: border-box;
}

@keyframes fade-rotate {
    0% {
        opacity: 0;
        transform: rotate(180deg);
    }

    100% {
        opacity: 1;
        transform: rotate(0);
    }
}

:deep(.fade-rotate:not([before-render])) {
    animation-name: fade-rotate;
}
</style>