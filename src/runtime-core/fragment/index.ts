

import { patch } from "../renderer";

export function processFragment(oldVnode, vnode, container, parentComponent, insertPlace) {

    vnode.children.forEach((element) => {
        patch(null, element, container, parentComponent, insertPlace)
    });
}

// 当解析子组件的时候renderSlot的时候，返回的是一个虚拟节点，然后slot的内容才能放在这个虚拟节点的children处
// 相当于子节点的render函数如下： h('div', {}, [btn, renderSlot(this.$slots, 'header', 1), foo, renderSlot(this.$slots, 'footer', 2)]);
// 因为slot的内容必须放在children中，所以renderSlot的返回值一定是一个vnode（1），但是由于slots[key]，存储的是一个数组，所以要套一层使得slot作为‘vnode（1）’的children属性去渲染

// 所以这里新增一种patch类型processFragment：（src\runtime-core\component\helper\renderSlots.ts）
// if(typeof slot === 'function') {
//     return createVNode('Fragment', {}, slot(props))   
// }
// 如果是Fragment，就走循环解析