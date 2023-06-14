
import { effect } from "../../reactivity/effect"
import { patch } from "../renderer"
// instance 组件实例对象 container

// 注意这里传入的vnode是一个组件类型的vnode，通过render函数返回了一个元素类型 vnode > subTree, 然后在递归patch subTree的时候将实例化的元素即el挂了上去，对应： const el = (vnode.el = type.createElement(vnode.type));

export function setupRenderEffect(instance, vnode ,container, insertPlace) {

    // 通过依赖收集，当proxy的响应式对象发生改变时，会执行下面的代码拿到新的subtree（proxy代理的值改变了所以执行render返回的subTree也会变）然后新的subtree和老的subtree去走更新逻辑
    // 暂存当前组件更新函数
    instance.update = effect(()=>{


        // instance上挂载一个isMounted属性，用来校验是否init，还是更新，instance.isMounted == true， 默认是初始化
        if(instance.isMounted) {
            console.log('init');
            
            
            // 执行render函数会返回一个虚拟节点树subTree，继续调用patch解析虚拟节点

            // 将instance.proxy绑定到render上，那么render的this.执行instance.proxy的get操作，读取返回setup的返回值
            const subTree = (instance.subTree = instance.render.call(instance.proxy)) // 缓存初始化的subTree到instance上，下面更新的时候用来比较
            
            //递归调用patch方法处理vnode树，如果是组件就运行组件mount，如果是元素就运行元素mount
            patch(null ,subTree, container, instance, insertPlace)

            // subTree是组件vnode下的虚拟节点，对其创建元素节点的时候，会将创建的元素节点作为参数el挂载到这个subTree的虚拟节点中，因此this.$el 实际上取的就是subTree.el
            vnode.el = subTree.el 

            instance.isMounted = false // 如果isMounted是false后续就说明是更新操作
        } else {
            console.log('update');
            

            const {next, vnode} = instance // vnode指代当前的虚拟节点，next值代表下次要更新的虚拟节点 操作：vnode > next
            if(next) {
                // 这一步其实是要将instance的vnode相关属性都替换成next上的，就相当于instance的vnode更新成了next，后面更新的时候使用的vnode就会是我们这里更新的next
                next.el = vnode.el // 把老节点的el赋值给要更新的虚拟节点的el
                updateComponentPreRender(instance, next)
            }

            const subTree = instance.render.call(instance.proxy) // 拿到新的subtree，因为执行到effect的更新了，说明当前this里面的值已经有改变了，使用render出来的树的内容和上一次是不一样的
            const preSubTree = instance.subTree // 拿到缓存下来的初始化的subTree

            instance.subTree = subTree // 更新缓存的subTree到instance上，下面更新的时候用来比较

            
            patch(preSubTree ,subTree, container, instance, insertPlace) // 传入新的subtree和老的subtree

        }

    })
}

function updateComponentPreRender(instance, nextVnode) {
    // 更新组件实例对象的vnode 和 next， 因为next已经替代之前的vnode了，相当于：vnode next > next null

    instance.vnode = nextVnode

    instance.next = null

    // 更新组件实例对象的props， 因为新的虚拟节点的props值发生了改变，所以要同步到组件实例对象中去

    instance.props = nextVnode.props
    
}