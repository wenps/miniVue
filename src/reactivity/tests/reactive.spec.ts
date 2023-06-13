import { isProxy, isReactive, isReadonly } from "../is";
import { reactive, readonly } from "../reactive";
describe('reactive', ()=>{
    // 处理reactive嵌套的对象里面还有对象的情况
    it('happy path',()=> {
        const original = {
            nested: {
              foo: 1,
            },
            array: [{ bar: 2 }],
            bar: {baz: 1},
          };
          const observed = reactive(original);
          const wrapped = readonly(original);
          expect(isReactive(observed.nested)).toBe(true);
          expect(isReactive(observed.array)).toBe(true);
          expect(isReactive(observed.array[0])).toBe(true);
          expect(isReadonly(wrapped.nested)).toBe(true);
          expect(isReadonly(wrapped.array)).toBe(true);
          expect(isReadonly(wrapped.array[0])).toBe(true);
          expect(isProxy(observed)).toBe(true);
          expect(isProxy(wrapped)).toBe(true);
    }),
    it('happy path',()=> {
        const original ={foo: 1};
        const observed = reactive(original);
        const user = readonly({ age: 11 });
        expect(original).not.toBe(observed);
        expect(observed.foo).toBe(1);
        expect(isReactive(observed)).toBe(true);
        expect(isReactive(original)).toBe(false);
        expect(isReadonly(user)).toBe(true);
        expect(isReadonly(original)).toBe(false);
    }),
    it('happy pass',()=>{
        const original = {
            age: 20
        }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(observed.age).toBe(20)
    })
})