import { isTracking, trackEffect, triggerEffect } from "./effect"
import { isObject } from "../share/index";
import { reactive } from "./reactive";

// reactive和ref的区别：ref都是一个单值，而proxy面向的是对象，因此ref会返回一个对象，value存储了这个值，通过getter，setter的方式进行数据读取，以及依赖收集，依赖执行。

// 创建RefImpl类用于初始化ref对象
class RefImpl {

    private _value: any
    // 新增dep属性用于存储依赖
    private dep
    // _rawValue去暂存原始对象
    private _rawValue: any;
    // __v_isRef属性用于判断当前的值是否是ref
    public  __v_isRef =  true

    constructor(value) {
        // 判断value是否对象，如果是对象则用reactive包裹
        this._value = convert(value)
        // 声明一个_rawValue，用来保存value，因为_value有可能会被reactive包裹成为一个proxy，因此需要用_rawValue去暂存原始对象
        this._rawValue = value
        this.dep = new Set()
    }

    get value() {
        if(isTracking()) {
            // 只有当执行了effect才能去进行依赖收集，因为依赖函数挂载在effect实例化的对象上，如果没有这个对象就无法收集依赖
            // 基于trackEffect去将依赖存储到dep中
            trackEffect(this.dep)
        }
        return this._value
    }

    set value(newValue) {
        // 如果新的值和旧的值相等，就不触发依赖
        // _value有可能是一个reactive即proxy对象，那么这里比较就不能用_value来比较，而是需要用_rawValue（即之前我们暂存的原始对象去比较）
        if(Object.is(newValue, this._rawValue)) { return }

        // 先修改值，再进行依赖触发
        // 判断newValue是否对象，如果是对象则用reactive包裹
        this._value = convert(newValue)
        this._rawValue = newValue
        // 基于triggerEffect去将存储到dep中的依赖执行
        triggerEffect(this.dep)
    }
}

function convert(value) {
    return isObject(value)?reactive(value):value
} 

// 调用ref函数时，给他返回一个RefImpl实例
export function ref(value) {
    return new RefImpl(value)
}


// ref 的原理
// ref对于单个值的响应式，因此ref实际上是一个函数，函数里面会实例化一个对象，这个对象有get，set方法。
// 因为effect的时候会创建一个activeEffect的全局对象，上面包含了effect传入的函数，因此当effect内部的函数执行时触发ref的get的时候
// 将activeEffect传入到ref实例化的对象的dep列表即可，当set的时候执行dep依赖即可
