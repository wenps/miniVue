// import { isObject } from "../../shared";
import { effect } from "../effect";
import { proxyRefs, isRef, unRef } from "../is";
import { reactive } from "../reactive";
import { ref } from "../ref";
describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });

  it("should be reactive", () => {
    const a: any = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    // 触发ref的依赖执行
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // set 的时候触发相同的值不会触发依赖
    // same value should not trigger
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  it("isRef", () => {
    const a = ref(1);
    const user = reactive({
      age: 1,
    });
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  });

  it("unRef", () => {
    const a = ref(1);
    
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  // 通常用在template里面，因为ref的话，需要.value才能用，proxyRefs可以直接用
  it("proxyRefs", () => {
    const user: any = {
      age: ref(8),
      name: "红红",
    };
    // get > age(ref) 返回.value || 非ref 返回本身的值
    const proxyUser: any = proxyRefs(user);
    expect(user.age.value).toBe(8);
    expect(proxyUser.age).toBe(8);
    expect(proxyUser.name).toBe("红红");
    proxyUser.age = 20
    // 如果set操作的时候给的是普通类型应该改.value的值，(.value值存进去对象的key的值，这个值有可能是ref也有可能是普通值，如果设置的时候改成普通值就算将这个对象下的key的值改成普通值)
    expect(user.age.value).toBe(20);
    expect(proxyUser.age).toBe(20);
    // 如果set操作的时候给的是ref类型应该直接替换
    proxyUser.age = ref(17);
    expect(proxyUser.age).toBe(17);
    expect(user.age.value).toBe(17);
  });

  it("proxyRefs", () => {
    // 如果入参是个单纯的ref(1)，会走get和set吗
    const user = ref(1) // 生成一个RefImpl的实例
    expect(user.value).toBe(1);
    let proxyUser: any = proxyRefs(user); // 基于上述实例对象生成一个proxyUser
    console.log(proxyUser.value) // 调用了get value方法，不是走proxy
    // 总结proxyRefs只能处理对象，用于简化获取对象下的ref值，可以直接抛出整个proxyRefs对象
  })
});

