import {
    h,
    ref,
    getCurrentInstance,
    nextTicker,
  } from "../../lib/guide-mini-vue.ems.js";
  
export default {
    name: "App",
    setup() {
        // 检测 log 触发了 100 次
        // 检测 nextTick 只触发了一次
        const count = ref(1);
        const instance = getCurrentInstance();

        function onClick() {
            for (let i = 0; i < 100; i++) {
                console.log("update");
                count.value = i;
            }

            // 因为内容都变成异步的了，就是上面的 count.value = i 此时count.value已经是99了，但是因为更新任务都在微任务的队列中，此时其实页面还没更新，所以页面还是count：1
            console.log(instance);


            // nextTicker 本质上就是启动一个微任务
            // 因为count.value = i这一系列的微任务会先加到微任务队列中，当启动微任务nextTicker的时候，就会排到count.value = i这一系列的微任务的后面，所以就能拿到更新后的视图

            // 使用1：通过nextTicker去获得更新后的视图
            nextTicker(() => {
                console.log(instance);
            });

            // 使用2：通过await获得更新后的视图
            // await nextTicker()
            // console.log(instance);
        }
        return {
            onClick,
            count,
        };
    },
    render() {
       const button = h("button", { onClick: this.onClick }, "update");
       const p = h("p", {}, "count:" + this.count.value);

        return h("div", {}, [button, p]);
    },
};
  