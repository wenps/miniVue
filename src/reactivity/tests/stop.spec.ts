import { reactive } from "../reactive";
import { effect, stop } from "../effect";
describe('stop',()=>{
    // stop 调用之后不会触发依赖
    it("stop", () => {
        let dummy;
        const obj = reactive({prop: 1});
        const runner = effect(() => {
            dummy = obj.prop;
        });
        obj.prop = 2;
        expect(dummy).toBe(2);
        // stop（runner）调用了runner下实例化的ReactiveEffect的清空方法，将targemap里面对应的key的deps全部删了，后面set的时候运行deps里面的方法就没东西给他运行
        stop(runner);
        
        // obj.prop = 3

        // get的时候会收集依赖，即触发track，重新收集依赖，targemap里面对应的key的deps又加了回去
        obj.prop++; // obj.prop = obj.prop + 1(有get，有set)，这时候会重新收集依赖，改了之后就不会重新收集
        expect(dummy).toBe(2);
        runner();
        //为什么runner执行之后obj.prop = 4可以继续监听了，因为跑了dummy = obj.prop 并没有触发依赖，而是直接跑了() => {dummy = obj.prop;}这个方法
        expect(dummy).toBe(3);
    })

    // stop 调用之后的回调函数
    it('onStop', () => {
        const obj = reactive({foo: 1});
        const onStop = jest.fn();
        let dummy;

        const runner = effect(()=> {
            dummy = obj.foo;
        },{
            onStop,
        })

        stop(runner);

        expect(onStop).toBeCalledTimes(1);
    })
})
