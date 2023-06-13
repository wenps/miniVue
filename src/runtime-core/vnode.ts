// 创建虚拟节点

import { ShareFlags } from '../share/shareFlags';

// 虚拟节点有两种主要类型
// 一种是组件，其中tyep是一个对象，这种代表是组件，props是组件的props用于父子组件传值, props不允许修改
// 一种是元素，其中接受type, props?, children?，type是一个字符串，代表元素类型

// 特殊类型
export const Fragment = Symbol('Fragment') // 用于处理slot[key]中返回的是数组的情况，直接渲染返回数组
export const Text = Symbol('Text')

export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        component: null, // 存储当前组件实例对象
        key: props && props.key,
        // 用于存储实例化的元素节点
        el: null,
        shareFlag: getShareFlags(type)
    };

    // 设置vnode 的children类型，判断是text类型还是array类型
    if (typeof children == 'string') {
        vnode.shareFlag |= ShareFlags.TEXT_CHILDREN;
    } else if (Array.isArray(children)) {
        vnode.shareFlag |= ShareFlags.ARRAY_CHILDREN;
    }

    if (vnode.shareFlag & ShareFlags.STATEFUL_COMPONENT) {
        // 如果是组件类型的vnode
        if(typeof children === 'object') {
            // children是obj类型，则说明这个vnode的children
            vnode.shareFlag |=  ShareFlags.SLOT_CHILDREN;
        }
    }
    

    return vnode;
}
// 获取当前vnode的类型，是组件类型还是元素类型
function getShareFlags(type) {
    return typeof type == 'string' ? ShareFlags.ELEMENT : ShareFlags.STATEFUL_COMPONENT;
}

// 用于处理text类型虚拟节点 （直接是文案那种）
export function createTextVNode(text) {
    return createVNode(Text, {}, text)
}