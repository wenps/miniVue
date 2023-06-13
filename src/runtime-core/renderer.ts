import { processComponent } from "./component/index"
import { processFragment } from "./fragment/index"
import { processElement } from "./element/index"
import { processText } from "./Text/index"
import { ShareFlags } from "../share/shareFlags"
import { Fragment, Text } from "./vnode"

let typeVue = ''

// 将虚拟节点vnode转换成真实节点挂载在容器container就是app根节点下
export function render(oldVnode, vnode, container, type) {
    
    if(!typeVue) {
        typeVue = type
    }

    
    patch(oldVnode, vnode, container, null, null)

}

// 新增一个虚拟节点oldVnode用来代表新的更新后的虚拟节点

// patch函数用来处理vnode，判断vnode是component组件类型还是element元素类型，如果是component组件则调用processComponent函数，如果是 element元素则调用processElement函数。
export function patch(oldVnode, vnode, container, parentComponent, insertPlace) { // patch函数会接收一个parentComponent，对应其父节点的组件实例对象

    

    const { type, shareFlag } = vnode
    

    // Fragment ——> 只渲染 children
    if (type == Fragment) {
        // 如果vnode的类型是Fragment，只渲染children
        processFragment(oldVnode, vnode, container, parentComponent, insertPlace)
    } else if (type == Text) {
        // 如果vnode的类型是Text，直接渲染文本
        processText(oldVnode, vnode, container)
    } else {
        if(shareFlag & ShareFlags.ELEMENT) {
            // 如果是元素类型 去处理元素，即element
            processElement(oldVnode, vnode, container, parentComponent, typeVue, insertPlace)
        }else if(shareFlag & ShareFlags.STATEFUL_COMPONENT) {
            // 如果是组件类型 去处理组件，即component
            processComponent(oldVnode, vnode, container, parentComponent, insertPlace)
        }
    }

}
