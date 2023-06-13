import { Fragment, createVNode } from "../../vnode";

// 因为children每一项只能接收vnode，如果slots有多个，我们需要对其进行封装保证其是vnode
export function renderSlot(slots, key, props) { // 父组件通过props往子组件的插槽里面传参

    const slot = slots[key]
    // slot是一个函数 ，用来接收父组件传入的props, 如:（props）=》{}返回带有完整的vnode并将参数设置进里面
    if (slot) {
        if(typeof slot === 'function') {
            
            return createVNode(Fragment, {}, slot(props))   
        }
    }
}