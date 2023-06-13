import { h, provide, inject } from '../../lib/guide-mini-vue.ems.js';

const Consumer = {
    name: 'Consumer',
    setup() {
       const foo = inject('foo')
       const bar = inject('bar')
       return  {
        bar,
        foo
       }
    },
    render() {
        return h('div', {}, [h('div', {}, "provide " + this.foo + " " + this.bar), h(ProvideTwo)])
    }
}

export const ProvideTwo = {
    name: 'provide',
    setup() {
        provide('foo', 'xiaoshanTwo')
        const foo = inject('foo')
        const bar = inject('barr', '21312')
        return  {
         bar,
         foo
        }
     },
     render() {
         return h('div', {}, [h('div', {}, "provide " + this.foo + " " + this.bar)])
     }
}

export const Provide = {
    name: 'ProvideTwo',
    setup() {
        provide('foo', 'xiaoshan')
        provide('bar', 'jiajia')
    },
    render() {
        return h('div', {}, [h('div', {}, "provide"), h(Consumer)])
    }
}



