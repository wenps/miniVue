'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// processElement函数去对元素进行处理
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // 创建元素节点
    const el = document.createElement(vnode.type);
    // 获取元素子节点和属性
    const { children, props } = vnode;
    // 设置元素子节点
    el.textContent = children;
    // 设置元素属性
    for (const key in props) {
        const value = props[key];
        el.setAttribute(key, value);
    }
    container.append(el);
}

// 创建一个组件实例对象
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}

// 调用setupComponent设置组件实例属性，包括props，slot等属性
function setupComponent(instance) {
    // initProps() 初始化组件实例的props
    // initSlot() 初始化组件实例的slot
    // 调用setupStatefulComponent设置组件实例状态（我们通常写的Vue组件都是有状态的组件，而函数式组件就是没状态组件）
    setupStatefulComponent(instance);
}
// 设置组件实例的状态
function setupStatefulComponent(instance) {
    const Component = instance.type; // instance 是createComponentInstance(vnode)创建的组件实例，而vnode由createVnode基于rootComponents生成，rootComponents是指代app.js，里面分别存有setup函数和render(render会返回虚拟节点，基于这个才能去渲染页面，一般的vue文件是template，但template下面的对象最后也会转化成虚拟节点，这里是直接转了省事一点)
    const { setup } = Component; // 解构Component里面的setup
    // 如果setup存在就执行
    if (setup) {
        //setup会有一个返回值，有可能是一个fn也可能是个obj
        // 如果是fn则认为是一个组件的render函数，如果是obj就把obj注入到组件中
        const setupResult = setup();
        // setupResult的不同类型，去对组件实例对应处理
        handleSetupResult(instance, setupResult);
    }
}
// setupResult的不同类型，去对组件实例对应处理
function handleSetupResult(instance, setupResult) {
    // setup返回值是obj就把obj注入到组件实例中
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    // render函数赋值给instance
    finishComponentSetup(instance);
}
// render函数赋值给instance
function finishComponentSetup(instance) {
    const component = instance.type; // instance 是createComponentInstance(vnode)创建的组件实例，而vnode由createVnode基于rootComponents生成，rootComponents是指代app.js，里面分别存有setup函数和render(render会返回虚拟节点，基于这个才能去渲染页面，一般的vue文件是template，但template下面的对象最后也会转化成虚拟节点，这里是直接转了省事一点)
    if (component.render) {
        instance.render = component.render;
    }
}

// setupRenderEffect函数用于获取 VNode 树并递归地处理，在其中首先调用组件实例对象的render函数获取 VNode 树，之后再调用patch方法递归地处理 VNode 树
function setupRenderEffect(instance, container) {
    console.log(instance);
    // 调用组件实例对象中 render 函数获取 VNode 树
    const subTree = instance.render();
    //递归调用patch方法处理vnode树，如果是组件就运行组件mount，如果是元素就运行元素mount
    patch(subTree, container);
}

// processComponent函数去对组件进行处理
// 调用setupRenderEffect函数，执行传入组件的render函数完成组件初始化
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
// 调用createComponentInstance函数，对当前传入的组件的进行实例化，之后props，slots，emit等都会挂载到该实例对象上
function mountComponent(vnode, container) {
    // 调用createComponentInstance函数，对当前传入的组件去创建一个组件实例
    const instance = createComponentInstance(vnode);
    console.log(instance);
    // 调用setupComponent设置组件属性，包括props，slot等属性
    setupComponent(instance);
    // setupRenderEffect函数用于获取 VNode 树并递归地处理，在其中首先调用组件实例对象的render函数获取 VNode 树，之后再调用patch方法递归地处理 VNode 树
    setupRenderEffect(instance, container);
}

// render函数就是渲染器，将虚拟DOM渲染成真实DOM。在render函数中调用了patch函数。这样做的目的是为了后续进行递归处理
// 将虚拟节点vnode转换成真实节点挂载在容器container下
function render(vnode, container) {
    //patch 函数，作用是去处理组件和element
    patch(vnode, container);
}
// patch函数是用来处理接受的vnode，首先对接受到的vnode进行类型判断，判断是component组件类型还是element元素类型，如果是component组件则调用processComponent函数，如果是 element元素则调用processElement函数。
function patch(vnode, container) {
    if (typeof vnode.type === 'string') {
        // 如果是元素类型 去处理元素，即element
        processElement(vnode, container);
    }
    else if (vnode.type !== null && typeof vnode.type === 'object') {
        // 如果是组件类型 去处理组件，即component
        processComponent(vnode, container);
    }
}

// 创建虚拟节点
function createVNode(type, props, children) {
    const vnode = {
        type, props, children
    };
    return vnode;
}

// 运行的核心流程，其中包括初始化流程和更新流程
// 实现createApp方法，接收一个根组件并对其解析，返回一个解析后的对象
function createApp(rootComponents) {
    // rootComponents是解析完之后内容渲染到的地方就是根节点 <div id="app"></div>
    return {
        mount(rootComponents) {
            // 先转换成v-node
            // 先接受一个组件即rootComponents(根节点)，然后把跟节点转换成虚拟节点
            // 后续的所有操作都会基于v-node去操作
            const vnode = createVNode(rootComponents); // 将节点转换成虚拟节点
            render(vnode, rootComponents);
        }
    };
}

// h就是createVNode函数
function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
