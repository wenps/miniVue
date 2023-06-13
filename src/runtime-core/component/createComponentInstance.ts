import { emit } from "./emit/componentEmit"


// 创建一个组件实例对象
export function createComponentInstance(vnode, parent) {
    
    const component = {
        vnode,
        type: vnode.type,
        next: null, // 存储新的寻节点
        // 先创建一个空的setupState，去暂存组件类型虚拟节点的setup返回值
        setupState: {},
        props: {}, // 创建一个props，用来存储组件虚拟节点接收的props，注意：props不允许改变 （props）
        slots: {}, // 创建一个slots，用来存储父组件传入的slots
        emit: () => {}, // 创建一个emit，用于暂存setup中获取到emit（emit）
        shareFlag: vnode.shareFlag,  // 存储当前对象的标识
        provide: parent?parent.provide:{}, // 暂存依赖注入，判断父级的provide是否存在如果存在就已父级的provide作为自己的provide
        parent: parent?parent:{}, // 存储父节点
        isMounted: true, // 判断当前组件实例对象是初次init，还是后续更新
    }
    
    component.emit = emit.bind(null, component) as any //（emit）,通过bind直接把emit挂载到component上，保证执行的时候取值正确

    return component
}
