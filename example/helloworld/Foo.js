import { h, renderSlot, getCurrentInstance } from '../../lib/guide-mini-vue.ems.js';
// 定义一个Foo组件用于验证Props功能
export const Foo = {
    // render 页面元素内容即template
    render() {
        const btn = h('button', { onClick: this.emitAdd }, 'emitAdd');
        // ui 页面内容
        const foo = h(
            'div',
            {
                class: ['red', 'hard'],
                onClick() {
                    console.log('click');
                }
            },
            'Foo' + this.count
        );

        // console.log(this.$slots);
        // 获取到渲染的元素————this.$slots 是个键值对的obj
        // 获取到渲染的位置————key去对应 this.$slots的键，将对应的slots挂载到对应的位置
        // return h('div', {}, [btn, renderSlot(this.$slots, 'header', 1), foo, renderSlot(this.$slots, 'footer', 2)]); // 通过this.$slots去获取父组件往Foo传入的slots（slots）
        return h('div', {}, [btn, renderSlot(this.$slots, 'header', 1), foo, renderSlot(this.$slots, 'footer', 2)]);
    },

    // 指代页面的业务逻辑内容，操作内容
    // 第一个参数props，用于父子组件传值
    setup(props, { emit }) { //（emit）

        const instance = getCurrentInstance()
        console.log('foo', instance);

        props.count = props.count + 4;

        // console.log(props);

        const emitAdd = () => {
            emit('add', 1, 2) // emit add 对应父组件的 onAdd事件
        };

        return {
            emitAdd //（emit）
        };
    }
};

// emit的流程setup函数中返回一个emit触发事件如emitAdd，执行完之后得到一个有emitAdd事件的props，在子组件的props中传入这个props，在执行绑定事件的时候就会将emitAdd绑定上去，执行时就会触发emit('add')，其中add是emit的事件event