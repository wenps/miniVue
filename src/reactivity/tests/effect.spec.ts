import { reactive } from "../reactive";
import { effect } from "../effect";
describe('effect', ()=>{
    it('happy pass',()=>{
        const user = reactive({
            age: 10,
            name: 'xiaoshan'
        })
        let nextAge;
        let name;
        effect(()=>{
            // 在user.age的时候触发proxy的get操作
            // 把effect里面的函数存储起来，这就是依赖收集
            nextAge = user.age + 1
            name = user.name
            console.log(nextAge);
        })
        expect(nextAge).toBe(11)

        // 在user.age修改的时候触发proxy的set操作
        // 存储起来的fn执行，这就是依赖执行
        user.age++;
        expect(nextAge).toBe(12);
    })
    it('', ()=>{
        // effect调用之后会返回一个function，这个function称为runner，调用runner会执行effect传入的函数，并返回返回值
        let foo = 10;
        // 获取effect调用后返回的runner函数
        const runner = effect(()=>{
            foo++
            return '123'
        })
        expect(foo).toBe(11)
        // 执行runner()函数，把runner函数返回值赋值给r
        const r = runner()
        expect(foo).toBe(12)
        expect(r).toBe('123')
    })
})