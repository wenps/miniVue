import { ReactiveEffect } from "./effect"

class computedImpl {
    private _fn: any
    private stop: boolean = true
    private _value: any
    private _effect: any
    constructor(fn) {
        this._fn = fn

        // 因为fn缓存进去了ReactiveEffect的实例对象中（1）
        // 创建一个ReactiveEffect对象，将fn传入
        this._effect = new ReactiveEffect(fn, () => {
            // 当值改变之后set操作之后，重新打开this.stop，然后因为这个回调和fn互斥，所以后续的reactive对象变更的时候都不会走缓存在ReactiveEffect实例的fn
            // 保证了参数只有value的时候才会被更新
            if (!this.stop) {
                this.stop = true
            }
        })
    }

    // 如果不调用computed的.value，fn是不会执行的
    get value() {
        // 如果fn依赖响应式对象的值发生改变时，这里的stop会重新打开，并计算新的_value
        // 调用完一次get转换，就不会再调用fn
        if(this.stop) {
            // 锁上
            this.stop = false
            // 当effect执行之后activeEffect这个全局变量被赋值，赋值为（1）中实例化的对象，因此当调用fn的时候触发了proxy的get操作，开始依赖收集activeEffect被加进去
            // 将fn的执行结果缓存到_value中
            this._value = this._effect.run()
        }

        // 后续读value的时候都是拿之前缓存下来的this._value即fn（）的执行结果
        return this._value
        
    }
}

export function computed(fn) {

    return new computedImpl(fn)
    
}

// computed的实现原理
// 在computed实际上是返回了一个实例化的对象，这个对象在实例化的时候接收了一个参数就是computed内部的回调。
// 因为computed是缓存的，所以返回的实例化对象中有一个get方法，取值的时候就会将传入的回调给执行了，并且把结果设置为实例化对象的内部属性，并返回出去。
// 所以computed在取值的时候实际上就读取了存在在对象中的回调函数的执行结果。
// 因为computed会缓存所以在执行get方法的时候会做一个开关，比如说lazy默认为true，只有当lazy为true才能执行回调函数，当函数执行完lazy改成false，所以后续的取值操作都不执行函数，实现了缓存的功能。
// 因为如果computed里面的响应式对象如果发生了改变，computed的结果是需要更新的，所以需要对computed里面的响应式对象进行一个依赖设置。
// vue在进行依赖收集的时候会用一个全局的变量去存储回调函数，在响应式对象get操作的时候就会判断这个全局变量是否存在，如果存在则加到依赖中，后续set操作的时候就拿这些存储的依赖处理执行。
// 所以computed在实例化对象的时候，会构造一个这样一个全局变量然后里面的回调函数的作用是如果执行lazy置为true，即开关打开
// 然后因为去取值的时候会执行一次函数，所以响应式对象get被触发，把lazy置为true的回调存入依赖中，下次响应式对象更新值即set的时候，computed返回的实例对象内部的开关就会被打开了。
// 所以我们下一次执行computed的value的时候，因为开关是开的所以会重新执行一遍函数并更新实例化对象的值，然后开关关上缓存起来，返回新的值。