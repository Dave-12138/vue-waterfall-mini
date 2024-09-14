<script setup lang="ts">
import { reactive } from 'vue';
import { Waterfall } from './main';
import BSInput from './components/BSInput.vue';
import { getRandImg } from './random-img';
import Lazy from './components/Lazy.vue';
const c = Array.from<string>("0123456789ABCDEF")
function sleep(ms: number = 1000) {
    return new Promise<void>(r => {
        setTimeout(() => r(), ms);
    });
}
const d = () => c[(c.length * Math.random()) | 0]
const _createItem = () => ({ id: crypto.randomUUID(), h: (3 + (Math.random() * 30) | 0) + 'rem', c: '#' + d() + d() + d(), src: getRandImg(), v: d() });
const createItem = () => {
    const e = _createItem();
    try {
        settings.itemModify(e);
    } catch (_) { }
    return e;
}
const props = reactive({
    transition: 300,
    joinDuration: 1000,
    animate: 'fade-in',
    breakPoint: (x: number) => Math.floor(x / 300),
    rowKey: (f: Record<string, any>) => f.id,
});
const settings = reactive({
    itemModify: (e: any) => delete e.src,
    key1: "v",
    key2: "c",
    addDelay: 3000,
    minAdd: 1,
    maxAdd: 5,
    maxCount: 20,
    style: {
        padding: "3rem",
        backgroundColor: "rgb(52, 66, 66)",
        boxSizing: "border-box"
    },
});
const list = reactive<Record<string, any>[]>([...Array.from({ length: 6 }).map(createItem)]);
async function push(count: number = 1) {
    list.push(...Array.from({ length: Math.floor(count) }).map(createItem));
    await sleep(3000);
}
sleep().then(async () => {
    while (true) {
        if (list.length < settings.maxCount) push(Math.random() * (settings.maxAdd - settings.minAdd) + settings.minAdd);
        await sleep(settings.addDelay);
    }
});
</script>
<template>
    <div class="container">
        <div class="my-3">
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
        <div class="my-3">
            <div class="alert alert-warning">演示工具 你可以点击卡片将它删除</div>
            <BSInput type="text" :value="JSON.stringify(list[0])" disabled>list[0]</BSInput>
            <BSInput type="function" v-model="settings.itemModify" list="item-mod">修改刚创建的对象</BSInput>
            <datalist id="item-mod">
                <option value="e=>delete e.src"></option>
                <option value="e=>e.h='4rem'"></option>
            </datalist>
            <BSInput type="text" v-model="settings.key1">item上的文字(大)</BSInput>
            <BSInput type="text" v-model="settings.key2">item上的文字(小，可以是html)</BSInput>
            <div class="input-group">
                <BSInput type="number" min="0" step="1" v-model="settings.addDelay">每</BSInput>
                <BSInput type="number" min="0" step="1" v-model="settings.minAdd">毫秒增加</BSInput>
                <BSInput type="number" min="0" step="1" v-model="settings.maxAdd">~</BSInput>
                <BSInput type="number" min="0" step="1" v-model="settings.maxCount">个新元素，直到个数达到</BSInput>
            </div>
            <button class="btn btn-outline-danger" @click="list.splice(0)">清空item</button>
            <BSInput type="text" v-model="settings.style.padding">padding</BSInput>
            <BSInput type="text" v-model="settings.style.backgroundColor">background-color</BSInput>
            <BSInput type="text" v-model="settings.style.boxSizing" list="box-sizing">box-sizing</BSInput>
            <datalist id="box-sizing">
                <option value="border-box"></option>
                <option value="content-box"></option>
            </datalist>
        </div>

    </div>
    <div class=" container-xl">
        <Waterfall :list="list" #="{ item, index }" :="props" :style="settings.style">
            <div class="my-item" @click="list.splice(index, 1)" :style="{ backgroundColor: item.c }">
                <Lazy v-if="item.src" :src="item.src" alt=""></Lazy>
                <div :style="{ height: item.h }">
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

    >img {
        width: 100%;
    }

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

.container-xl:deep(.fade-rotate:not([before-render])) {
    animation-name: fade-rotate;
}
</style>