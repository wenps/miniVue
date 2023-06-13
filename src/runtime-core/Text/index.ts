
// 如果是text类型虚拟节点就直接渲染上去
export function processText(oldVnode, vnode, container) {
    const {children} = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}