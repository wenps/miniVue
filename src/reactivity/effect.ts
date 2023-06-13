// 创建一个全局对象activeEffect存储effect的fn，这个fn后面会被存储到依赖里面
let activeEffect;
// 创建一个全局变量shouldTrack，判断是否应该在get的时候收集依赖
let shouldTrack = true;

// 创建一个ReactiveEffect的类
export class ReactiveEffect {
    private _fn: any;
    constructor(fn, public scheduler) {
        // 声明一个_fn去存储传入的fn
        this._fn= fn
    }
    // 调用run方法的时候执行传入的fn
    run() {
        
        // 调用过stop函数之后this.active就会变成false，如果this.active == false，说明调用了stop 那么就
        if(!this.active) {
            return this._fn()  // runner() 函数调用的时候 返回runner()函数的返回值
        }
        // 保证run的时候才进行依赖收集
        shouldTrack = true
        // 因为run()是在_effect里面运行的，使用this指向的就是_effect（1）
        activeEffect = this // 把this挂载在全局对象上， 用来收集依赖，到时候依赖add的就是这个activeEffect
        const result = this._fn()  // runner() 函数调用的时候 返回runner()函数的返回值 ， 注意调用_fn()的时候会触发track依赖收集
        shouldTrack = false
        return result // runner() 函数调用的时候 返回runner()函数的返回值
    }

    active = true // 防止反复调用stop方法
    deps = []; // 创建数组存储dep依赖关系
    onStop?: any; // 调用stop之后的回调函数
    // 调用stop方法时，清空里面的dep
    stop() {
        if(this.active) {
            cleanupEffect(this)
            if(this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

// 抽离清空dep方法
function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    });
    effect.deps.length = 0
}

export function effect(fn, options:any = {}) {
    const scheduler = options.scheduler
    const _effect = new ReactiveEffect(fn, scheduler)

    // 挂载stop等options
    Object.assign(_effect, options)
    
    // 创建effect的时候的需要执行传入的fn
    // 提供一个run方法，去执行（1）
    _effect.run()

     const runner:any = _effect.run.bind(_effect) // 处理指针 返回runner函数

     runner.effect = _effect // 给返回的runner挂上一个effect属性，指向的创建的ReactiveEffect实例即_effect，然后这个runner上挂载了ReactiveEffect实例，执行stop的时候需要传入实例，所以就可以用这个runner下的ReactiveEffect实例

     return runner
}


// targetMap => {target: depsMap()}
// depsMap => {key: dep()}
// dep() 是一个Set(), 里面存了fn
// 定义全局变量targetMap 存储依赖收集
const targetMap = new Map()

export function isTracking() {
    // if (!activeEffect) return // 如果activeEffect不存在就结束
    // if (!shouldTrack) return // 如果shouldTrack开关没打开就结束，作用于run的时候，stop之后就关闭这个开关，后续不支持依赖收集
    return shouldTrack && activeEffect !== undefined
}

// 依赖收集，对应完整的reactive对象
export function track(target, key) {

    // 是否支持依赖收集
    if(!isTracking()) return

    // 处理依赖间的映射关系

    // target > key > dep
    // 存储对象和对象下key map的映射关系
    let depsMap = targetMap.get(target)
    if(!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    // 依赖收集
    trackEffect(dep)
}

// 抽离实际依赖收集函数
export function trackEffect(dep) {
    if(dep.has(activeEffect)) return // 如果这个activeEffect已存在就不需要往里面加 
    dep.add(activeEffect)
    // 推广activeEffect反向收集dep，这个数组存储了这个dep的地址引用
    activeEffect.deps.push(dep)
}



// 依赖执行
export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    triggerEffect(dep)
}

// 抽离实际依赖执行函数
export function triggerEffect(dep) {
    for(let element of dep) {
        // scheduler逻辑，如果有scheduler就执行scheduler
        if(element.scheduler) {
            element.scheduler()
        }else {
            element.run()
        }
    };
}

// 导出stop方法
export function stop(runner) {
    // 当运行的时候运行的是runner下的effect实例，上的stop方法
    runner.effect.stop()
}