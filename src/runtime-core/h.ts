import { createVNode } from "./vnode";
// h就是createVNode函数
export function h(type, props?, children?) {
    return createVNode(type, props, children)
}
