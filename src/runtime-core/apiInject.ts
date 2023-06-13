// 依赖注入，依赖读取函数

import { getCurrentInstance } from "./index";

export function provide(key, value) {
    // 存
    // 通过getCurrentInstance拿到当前组件实例对象
    const currentInstance: any = getCurrentInstance()
    // 如果组件实例对象存在，则设置其provide属性
    if(currentInstance) {
        let { provide } = currentInstance

        console.log(currentInstance)

        // 设置provide的原型链指向父级的provide
        const parentProvide = currentInstance.parent.provide

        if(provide == parentProvide) {
            provide = currentInstance.provide = Object.create(parentProvide)
        }

        // 设置依赖值
        provide[key] = value
    }
}
// defaultValue 默认值
export function inject(key, defaultValue) {
    // 取
    // 通过getCurrentInstance拿到当前组件实例对象
    const currentInstance: any = getCurrentInstance()
    if(currentInstance) {
        const provideContent = currentInstance.parent.provide
        if(key in provideContent){
            return provideContent[key]
        }else if(defaultValue){
            if(typeof defaultValue === 'function'){
                return defaultValue()
            }
            return defaultValue
        }
    }
}