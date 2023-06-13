import { isObject } from "../share/index";
import { reactiveHandler, readonlyHandler, shallowReadonlyHandler } from "./baseHandlers";

// reactive实际上就是对对象的Proxy操作
export function reactive(raw) {
    return createReactiveObj(raw, reactiveHandler)
}

// readonly不能set
export function readonly(raw) {
    return createReactiveObj(raw, readonlyHandler)
}

// shallowReadonly表层是readonly，内层是普通对象（常用于优化，防止整个对象都是proxy消耗性能）
export function shallowReadonly(raw) {
    return createReactiveObj(raw, shallowReadonlyHandler)
}

function createReactiveObj(target, handler) {
    if(!isObject(target)) {
        console.warn(`target: ${target}必须是个对象`)
        return target
    }
    return new Proxy(target, handler)
}