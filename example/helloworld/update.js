import { h, ref } from '../../lib/guide-mini-vue.ems.js';
export const App = {
    render() {
        return h('div', {id:"root", foo: this.props.value.foo}, [
            h('div', {}, "count" + this.count.value),
            h('button', {onClick: this.onClick}, "click"),
            h('button', {onClick: this.onChangeProps1, foo: this.props.value.foo}, "修改" + this.props.value.foo),
            h('button', {onClick: this.onChangeProps2, foo: this.props.value.foo}, "undefined"),
            h('button', {onClick: this.onChangeProps3, foo: this.props.value.foo}, "移除"),
        ])
    },

    setup() {
        const count = ref(0)
        const props = ref({
            foo: 'foo',
            bar: 'bar'
        })
        const onClick = () => {
            count.value++
        }
        const onChangeProps1 = () => {
            props.value.foo = 'xiaoshan'
            console.log(props.value.foo);
        }
        const onChangeProps2 = () => {
            props.value.foo = undefined
        }
        const onChangeProps3 = () => {
            props.value = {
                bar: 'foo',
            }
        }

        return {
            count,
            props,
            onClick,
            onChangeProps1,
            onChangeProps2,
            onChangeProps3
        };
    }
};