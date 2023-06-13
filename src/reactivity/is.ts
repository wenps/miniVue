export const enum IsType {
    IS_REACTIVE = '_v__is_reactive',
    IS_READONLY = '_v__is_readonly'
}

export function isReactive(value) {
    return !!value[IsType.IS_REACTIVE]
}

export function isReadonly(value) {
    return !!value[IsType.IS_READONLY]
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value) 
}

export function isRef(value) {
    return !!value['__v_isRef']
}

// unRef用于判断当前的值，是否是ref，如果是ref就返回ref.value，反之则返回value
export function unRef(ref) {
    return isRef(ref)? ref.value : ref
}

// 通常用在template里面，因为ref的话，需要.value才能用，proxyRefs可以直接用，比较方便
export function proxyRefs(proxyRefsObj) {
    // 套一层proxy
    return new Proxy(proxyRefsObj, {
        get(target, key) {
            // 如果是ref类型就返回.value
            // 如果不是就返回值的本身
            return unRef(Reflect.get(target, key))
        },

        set(target, key, value) {
            // 如果原来的值是ref类型，且value不是一个ref类型，那么将value设置到ref原来的value上即可
            // 类似：
            // a = ref(1)
            // a = 30
            // 因为a是个ref类型，不能说给个普通值他就不是ref了，只是将原来ref的value改成新的值而已
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value
            } else {
                // 反之如果是同类型转换，直接替代即可
                return Reflect.set(target, key, value)
            }
        }
    })
}