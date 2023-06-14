import { createComponentInstance } from "./createComponentInstance"
import { shouldUpdateComponent } from "./helper/shouldUpdateComponent"
import { setupComponent } from "./setupComponent"
import { setupRenderEffect } from "./setupRenderEffect"



// processComponent函数去对组件进行处理

// 调用setupRenderEffect函数，执行传入组件的render函数完成组件初始化
export function processComponent(oldVnode, vnode, container, parentComponent, insertPlace) {


    // 当虚拟节点list里面有组件类型时，我们更新会返回新的subtree，然后就会走children的遍历，是相同的会继续递归patch，因为是组件所以patch之后就执行processComponent
    // 如果我们只有mountComponent，那么我们每次进去都是会走新建流程，然后会创建一个新的组件实例对象，oldvnode为空，创建一个新的节点，不会更新之前的组件而是创建一个传入的vnode的组件出来
    // 所以这里创建了一个updateComponent方法，继承之前的vnode的组件实例对象，props等，因为之前的实例对象状态已经更新所以，会走更新流程，并且指向的是同一个el所以会正常更新组件

    // 判断老节点是否存在，如果当前vnode没有老节点则走初始化逻辑


    // 老节点不存在时走初始化逻辑
    if(!oldVnode) {
        // mountComponent初始化组件逻辑
        mountComponent(oldVnode, vnode, container, parentComponent, insertPlace)
    }
    // 老节点存在走更新逻辑 
    else {
        updateComponent(oldVnode, vnode)
    }
}

// 调用createComponentInstance函数，对当前传入的组件的进行实例化，之后props，slots，emit等都会挂载到该实例对象上
function mountComponent(oldVnode, vnode: any, container, parentComponent, insertPlace) {
    // 调用createComponentInstance函数，对当前传入的组件去创建一个组件实例
    const instance = vnode.component = createComponentInstance(vnode, parentComponent) // vnode.component 将创建的组件实例挂载到当前虚拟节点中
    
    // 调用setupComponent设置组件属性，包括props，slot等属性
    setupComponent(instance)

    // setupRenderEffect函数用于获取 VNode 树并递归地处理，在其中首先调用组件实例对象的render函数获取 VNode 树，之后再调用patch方法递归地处理 VNode 树
    setupRenderEffect(instance, vnode, container, insertPlace)
}

// 调用updateComponent函数，对当前传入的组件的进行更新
function updateComponent(oldVnode, newVnode) {
    const instance = newVnode.component = oldVnode.component // 读取挂载在vnode的组件实例对象下的update，即effect

    // 判断当前的节点是否需要更新，这里判断的是props
    if(shouldUpdateComponent(oldVnode, newVnode)) {
        
        instance.next = newVnode // 把新的虚拟节点赋值给组件实例对象，然后调用更新函数 ，next表示下次要更新的虚拟节点

        // 通过调用effect返回的runner显式去更新页面，就是去执行一遍setupRenderEffect的effect函数
        instance.update()
    } else {
        // 如果当前节点不需要更新，也要重置当前的节点信息，在updateComponentPreRender函数里面做的事情这里也要拿过来
        newVnode.el = oldVnode.el
        instance.vnode = newVnode
    }
    
}



