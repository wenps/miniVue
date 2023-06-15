import { ReactiveEffect } from "../../../reactivity/effect"
import { queuePreFlushCb } from "../scheduler"

export function watchEffect(source) { // 需要放到组件渲染之前
    function job() {
        effect.run()
    }

    // 封装onCleanup逻辑
    let cleanup
    const onCleanup = function(fn) {
        cleanup = fn
        //  设置effect的onstop，即stop之后的回调，保证stop之后还能正常调用cleanup
        effect.onStop = () => {
            fn()
        }
    }

    function getter() {
        if(cleanup) cleanup()
        source(onCleanup)
    }

    // 将watchEffect的函数添加到组件渲染前置队列，这样子在组件渲染之前就会先执行queuePreFlushCb
    const effect = new ReactiveEffect(getter, ()=> {
        queuePreFlushCb(job())
    })
    // watchEffect 默认进来会执行一次
    effect.run()

    // 返回一个函数，用于调用effect的stop
    return () => {
        effect.stop()
    }
}