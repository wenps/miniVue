import { reactive } from "../reactive";
import { effect } from "../effect";
describe('scheduler',()=>{
    it('scheduler',()=> {
        // 1.通过effect的第二个参数给定的一个scheduler的"fn"
        // 2.当effect第一次执行的时候还会执行fn，即effect的第一个参数
        // 3.当响应对象的时候set的时候，即update变更的时候，effect就不会执行fn(第一个参数)，而是执行scheduler的"fn"即第二个参数
        // 4.如果执行runner的时候，会再次执行fn，即effect的第一个参数
        let dummy;
        let run: any;
        const scheduler =jest.fn(()=>{
            // runner 对应的是effect，而effect默认返回一个函数runner ，执行的时候会运行传入fn
            // 所以这里拿到的其实就是"dummy = obj.foo"这个函数
            console.log('111')
            run = runner;
        })
        const obj = reactive({foo:1})
        const runner = effect(()=>{
            console.log('222')
            dummy = obj.foo
        }, { scheduler })
        // 不会被调用，第一次正常执行effect的第一个参数
        expect(scheduler).not.toHaveBeenCalled()
        // 执行完之后"dummy = obj.foo"所以dummy = 1
        expect(dummy).toBe(1)
        // 调用的set方法，这时会判断scheduler有没有，有就执行scheduler
        obj.foo++
        console.log(obj.foo, dummy)
        // 响应式对象被调用时会调用scheduler，而不是一开始的dummy = obj.foo这个fn
        // 注意：scheduler这里做的是一个赋值操作！！！run = runner;也就是说这时候run 等于了runner即dummy = obj.foo但没有执行，dummy值所以没有改变
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)
        // 手动执行一下run()，所以dummy = obj.foo，所以dummy = 2
        run()
        console.log(obj.foo, dummy)
        expect(dummy).toBe(2)
    })
})