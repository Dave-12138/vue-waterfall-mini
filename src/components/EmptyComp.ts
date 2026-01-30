import { FunctionalComponent } from "vue";

const EmptyComp: FunctionalComponent = (prop, { slots }) => slots.default?.();
export default EmptyComp;