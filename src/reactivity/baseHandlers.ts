import { track, trigger } from "./effect";
import { IsType } from "./is";
import { reactive, readonly } from "./reactive";
import { isObject } from "../share/index";

// 初始化createdGetter()，缓存到get
const get = createdGetter()
// 初始化createSetter()，缓存到set
const set = createSetter()
// 初始化createdGetter(true)，缓存到readonlyGet
const readonlyGet = createdGetter(true)
// 初始化createdGetter(true, true)，缓存到shallowReadonlyGet
const shallowReadonlyGet = createdGetter(true, true)

// 抽离get方法
function createdGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        // 判断是否reactive
        if(key == IsType.IS_REACTIVE) {
            return !isReadonly // isReadonly = false 的时候是reactive
        }
        // 判断是否readonly
        if(key == IsType.IS_READONLY) {
            return isReadonly // isReadonly = true 的时候是readonly
        }

         // target 访问的对象， key 访问对象的值
        const res = Reflect.get(target, key)

        if (isShallow) {
            return res
        }

         // 判断当前res是否obj，如果是则继续，则继续调用reactive，并将生成的reactive对象返回
         if(isObject(res)) {
            return isReadonly?readonly(res):reactive(res)
         }

        // isReadonly不触发依赖
        if(!isReadonly) {
            // 依赖收集
            track(target, key)
        }
        return res
    }
}

// 抽离set方法
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        // 依赖触发
        trigger(target, key)
        return res
    }
}

export const reactiveHandler = {
    get, // 抽离get方法
    set // 抽离set方法
}

 export const readonlyHandler = {
    get: readonlyGet, // 抽离get方法
    set(target, key, value) {
        console.warn(`${key}不能设置为${value}，因为是readonly`, target);
        // 不能set所以直接返回true
        return true
    }
}

export const shallowReadonlyHandler = {
    get: shallowReadonlyGet, // 抽离get方法
    set(target, key, value) {
        console.warn(`${key}不能设置为${value}，因为是shallowReadonly`, target);
        // 不能set所以直接返回true
        return true
    }
}