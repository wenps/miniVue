// （slot）

import { ShareFlags } from "../../../share/shareFlags";

// 接收组件类型的children，并将其挂载在组件实例对象上
export function initSlot(instance, children) {
    
    // 判断当前的元素实例对象有没有slot
    if (instance.shareFlag & ShareFlags.SLOT_CHILDREN) {
        // children 是一个键值对类型的数据，用于确认slot的位置
        const slots = {};
        for (const key in children) {
            const value = children[key]
            slots[key] = (props) =>{ return Array.isArray(value(props)) ? value(props):[value(props)]} // 返回一个接收传入的props的函数，执行之后可以得到一个vnode节点或vnode节点数组
        }
        instance.slots = slots
    }
}

// slot原理，父组件render函数中接收一个子组件做其children数组中的一个值，然后往子组件的children中传入一个vnode，作为插槽的值
// 然后对子组件进行解析时，会判断是否组件虚拟节点，如果是就去initSlot，因为对子组件生成组件实例对象时传入了vnode（插槽），而vnode的children就是父组件设置的slot vnode
// 所以直接把slot vnode挂到子组件实例对象中，当调用render的时候因为this指向的是子组件实例对象，所以就可以通过this拿到父组件往子组件里面传入的slot vnode

