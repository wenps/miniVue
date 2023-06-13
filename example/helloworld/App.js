import { h, createTextVNode, getCurrentInstance } from '../../lib/guide-mini-vue.ems.js';
import { Foo } from './foo.js';
export const App = {
    // render 页面元素内容即template
    render() {
        let node1 = h('p', { class: 'red' }, 'hi')
        let node2 = h(
            Foo,
            {
                count: 1,
                // on + Add 对应子组件emit出来的add事件
                onAdd(a, b) {
                    console.log('onadd', a, b);
                }
            },
            // 往插槽传参
            // 具名插槽
            // 通过key：value的方式确定对应key的slot
            { header: (age)=>[h('p', { class: 'red' }, 'header'+age), createTextVNode('你好呀')], footer: (age)=>h('p', { class: 'red' }, 'footer'+age) } 
            // 往组件类型的虚拟节点的children中加入一个新的虚拟节点，那么这个就是slot的用法，后面这个h('p', { class: 'red' }, 'hi')会被挂载到Foo这个组件类型的的children中进行渲染（slots）
        )// 接收一个子组件Foo，并传入一个Props

        // ui 页面内容
        return h(
            'div',
            {
                id: 'root',
                class: ['red', 'hard']
            },
            // 'hi' + this.msg
            // [h('p',{class:'red'},'hi'), h('p',{class:'blue'},'vue3')]
            [
                node1,
                node2
            ] 
        );
    },

    // 指代页面的业务逻辑内容，操作内容
    setup() {

        // 获取当前组件的实例对象
        const instance = getCurrentInstance()
        console.log('app', instance);

        return {
            msg: 'mini-vue'
        };
    }
};