import { reactive } from '../reactive';
import { computed } from '../computed';


describe('effect', () => {
    it("happy path", () => {
        const user = reactive({
            age: 1,
        });
        const age = computed(() => {
            return user.age;
        })

        expect(age.value).toBe(1);
    })

    it("should compute lazily", () => {
        const value = reactive({
            foo: 1,
        });
        const getter = jest.fn(() => {
            return value.foo;
        })
        const cValue = computed(getter);

        // lazy
        expect(getter).not.toHaveBeenCalled();
        // 调用了cValue.value所以函数执行了一次
        expect(cValue.value).toBe(1);
        expect(getter).toHaveBeenCalledTimes(1);

        // should not compute again
        // get操作的时候不会再次调用computed里面的函数
        cValue.value; // get
        expect(getter).toHaveBeenCalledTimes(1);

        // should not compute until needed
        value.foo = 2; //set  trigger -> effect -> get 重新执行
        expect(getter).toHaveBeenCalledTimes(1);

        // now it should compute
        expect(cValue.value).toBe(2);
        expect(getter).toHaveBeenCalledTimes(2);

        // should not compute again
        cValue.value; ///get
        expect(getter).toHaveBeenCalledTimes(2);
    })
 })
