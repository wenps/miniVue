import { hasOwn } from "../../../share/index"

// 当使用this.$el时，按照vue的规范，需要返回当前组件的元素实例
// 当使用this.$slots时，按照vue的规范，父组件接收子组件作为其下属vnode，slot则是接收子组件时，父组件往子组件里面传入的children值
const publicMap = {
    $el: (i) => i.vnode.el, 
    $slots: (i) => i.slots,
    $props: (i) => i.props,
}

// 抽离组件实例对象的proxy的get操作函数
export const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {

        const { setupState, props } = instance

        // 如果在setup的返回值中，则返回的对应的值
        if (hasOwn(setupState, key)) {
            return setupState[key]
        }

        // 如果在传入的props中，则返回的对应的值 （props）
        if (hasOwn(props, key)) {
            return props[key]
        }

        // 当使用this.$el时，按照vue的规范，需要返回当前组件的元素实例
        if (publicMap[key]) {
            return publicMap[key](instance)
        }

    }
}
