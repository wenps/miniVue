import { shallowReadonly } from "../../reactivity/reactive";
import { initProps } from "./init/componentProps";
import { initSlot } from "./init/componentSlot";
import { PublicInstanceProxyHandlers } from "./proxy/componentProxy"

let currentInstance = null // 创建一个全局变量，用来缓存当前组件实例对象 // （2）


// 调用setupComponent，去补充组件实例对象instance上的props等属性，后续再创建一个proxy挂在组件实例对象上，当执行render函数时this会指向instance
export function setupComponent(instance) {

    initProps(instance, instance.vnode.props) // 初始化组件实例的props，对于组件虚拟节点而言props是传入的props，因此将vnode.props提前到组件实例对象instance的props中

    initSlot(instance, instance.vnode.children) // 初始化组件实例的slot，对于组件虚拟节点而言children是传入的slot中的内容，因此将vnode.children中的内容提前到组件实例对象instance的slots中
    
    // 调用setupStatefulComponent设置组件实例状态  （我们通常写的Vue组件都是有状态的组件，而函数式组件就是没状态组件）
    setupStatefulComponent(instance)
}


// 设置组件实例的状态
function setupStatefulComponent(instance: any) {
    const Component = instance.type // 因为是组件类型，所以type指代了组件渲染对象，上面有setup，render等（1），然后instance包括了组件渲染对象以及组件的props等参数

    // 创建一个proxy类型对象，挂载到组件实例对象（instance），对这个对象进行get操作的时候，去查询setupState,。
    // 将创建的proxy类型对象绑定到组件vnode的render函数中，那么执行render函数的时候this就指向了创建的proxy对象
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

    const {setup} = Component // 解构Component里面的setup

    // 如果setup存在就执行
    if(setup) {

       setCurrentInstance(instance) 

        

        // setup会有一个返回值，可能是fn或obj， 如果是fn则认为是一个组件的render函数，如果是obj就把obj注入到组件中
        // 如果是组件虚拟节点，那么传入的props不允许改动，因此需要将props设置为shallowReadonly类型 （props）
        // 实现emit功能：emit是个函数，所以将emit挂载到事件实例对象上 （emit）, 在setup函数中返回出去，在子组件中的setup函数中去触发时，就会将传进来的父组件中对应的函数去执行，实现emit的功能
        const setupResult =  setup(shallowReadonly(instance.props), {emit: instance.emit}) // 把props和emit传入，在setup函数中使用即可，然后render中也使用了props等则通过proxy去代理获取

        // 当这setup执行完之后，取消组件实例对象在currentInstance中的缓存
        currentInstance = null // （2）
        
        // setup返回值是obj就把obj注入到组件实例中
        if (typeof setupResult === 'object') {
            instance.setupState = setupResult
        }

        finishComponentSetup(instance)

    }
}

function finishComponentSetup(instance) {
    const Component = instance.type

    if(compiler && !Component.render) { //  Component.render 组件自身render优先级最高
        if (Component.template) { // 判断当前是否提供了template，如果提供了则借助compiler转成render
            Component.render  = compiler(Component.template)
        }
    }

    // （1）这一步是将组件的对象里面render提前到instance里面
    instance.render = Component.render 
}

// 获取当前组件实例对象
export function getCurrentInstance() {
    return currentInstance
}

// 设置当前组件实例对象
export function setCurrentInstance(instance) {
    // 创建一个全局变量，将组件实例对象存储在currentInstance中，当setup使用了getCurrentInstance的话，就可以拿到外面缓存下来的组件实例对象
    currentInstance = instance // （2）
}

let compiler

// 通过这个compiler全局对象去获取到 模板转render的函数
export function registerRuntimeCompiler(_compiler) {
    compiler = _compiler
}


 