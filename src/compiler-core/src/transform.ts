import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING } from "./helpersMap"

export function transform(root, options = {}) {

    const context = createTransformContext(root, options) // 封装一个全局上下文对象

    // 遍历 - 深度优先搜索
    traverseNode(root, context)

    // root.codegenNode 基于此创建render代码
    createRootCodegen(root)

    root.helpers = [...context.helpers.keys()]
}

// 为根节点提供一个指向默认编译节点的属性
function createRootCodegen(root: any) {

    const child = root.children[0]
    if(child.type == NodeTypes.ELEMENT) {
        root.codegenNode = child.codegenNode // 这一步只是为了拿 root.children[0] codegen element类型中处理可以看到
    } else {
        root.codegenNode = root.children[0]
    }
}

// 遍历 - 深度优先搜索
function traverseNode(node, context) {

    const nodeTransforms = context.nodeTransforms // 获取全局上下文中的插件数组

    const exitFns:any = [] // 创建一个数组收集退出函数
    

    // 遍历执行插件数组
    for (let i = 0; i < nodeTransforms.length; i++) {
        const onExit = nodeTransforms[i](node, context); // 如果是退出函数那就做一层封装，将真实执行函数返回
        if(onExit) exitFns.push(onExit) // 存储真实执行函数
    }

    // 针对不同类型节点作操作
    switch (node.type) {
         // 插值类型
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING) // 往全局对象上加上依赖，因为解析插值类型需要导入这个依赖
            break;
         // 元素类型和根节点类型
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            // 递归子节点
            traverseChildren(node, context) // 因为元素和根节点都有children ，所有需要递归children
            break;
        default:
            break;
    }

    // 退出的时候执行一下退出函数
    let i = exitFns.length
    while (i--) {
        exitFns[i]()
    }
    
}

// 递归子节点
function traverseChildren(node, context) {
    const children = node.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const curNode = children[i];
            traverseNode(curNode, context) // 递归
        }
    }
}

// 封装一个全局上下文对象
function createTransformContext(root: any, options: any) {
    
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        // 封装需要加载的依赖
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1)
        }
    }
    return context
}

