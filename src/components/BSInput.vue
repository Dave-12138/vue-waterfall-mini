<script lang="ts" setup>
import { computed } from 'vue';
const props = defineProps({ id: String, type: String, value: {} });
const id = computed(() => props.id || 'input' + crypto.randomUUID());
const value = defineModel<Function | any>();
const isFunc = computed(() => props.type === 'function');
const noModel = computed(() => props.value !== undefined);
const type = computed(() => isFunc.value ? 'text' : props.type);
const text = computed({
    get() {
        return value.value?.toString() || props.value;
    },
    set(t) {
        try {
            value.value = eval(t);
        } catch (_) { }
    }
});
</script>
<template>
    <div class="input-group">
        <label :for="id" class="input-group-text">
            <slot :id="id"></slot>
        </label>
        <input v-if="isFunc || noModel" :type="type" :="$attrs" :id="id" class="form-control" v-model.lazy="text">
        <input v-else :type="type" :="$attrs" :id="id" class="form-control" v-model="value">
    </div>
</template>