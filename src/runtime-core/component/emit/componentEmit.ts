import { capitalize } from "../../../share/index"

// 创建emit方法 （emit）event是事件名add，对应的父组件就onAdd，
export function emit(instance, event, ...argument) {
    const { props } = instance // instance 是创建的子组件实例对象，里面有props等内容，父组件然后绑定的事件会作为props传入到子组件实例中
    // 所以这里是子组件的emit函数，但是因为props中传入了父组件的emit响应事件即onAdd，所以这里可以通过props去执行传入的props的onAdd实现emit功能
    
    // 获取子组件emit事件名所对应的父组件的emit响应事件名
    const rootEventName = capitalize(event)
    props[rootEventName](...argument)
}