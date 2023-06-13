import { render } from "./renderer"
import { createVNode } from "./vnode"

// 运行的核心流程，其中包括初始化流程和更新流程

export function createAppApi(type) {
    
    // 实现createApp方法，接收一个根组件并对其解析，返回一个解析后的对象
    return function createApp(App) {

        // rootComponents是解析完之后内容渲染到的地方就是根节点 <div id="app"></div>
        return {
            // mount 接受一个根节点
            mount(rootComponents) {
                // 先转换成v-node
                // 先接受一个组件即rootComponents(根节点)，然后把跟节点转换成虚拟节点
                // 后续的所有操作都会基于v-node去操作

                // 这里App是一个组件类型的虚拟节点，有setup，render等
                const vnode = createVNode(App) // 生成一个组件类型的虚拟节点

                // 生成的虚拟节点是 {组件， props， children}（组件类型）

                // render函数将vnode挂到rootComponents（即根节点下）
                render(null, vnode, rootComponents, type)
            }
        }
    }
}