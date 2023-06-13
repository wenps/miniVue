export function shouldUpdateComponent(oldVnode, newVnode) {
    const {props: oldprops} = oldVnode
    const {props: newprops} = newVnode
    for (const key in newprops) {
        if(newprops[key]!=oldprops[key]) {
            return true
        }
    }
    return false
}