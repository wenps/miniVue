import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING, helperMapName } from "./helpersMap"

export function generate(ast) {

    const context = createCodegenContext()
    const {push} = context
    
    // 组装成render函数

    // 抽离导入资源类型代码
    genFunctionPreamble(push, ast)

    // render函数返回部分组装
    push('return')

    const functionName = "render"
    const args = ['_ctx', '_cache']
    const signature = args.join(",")

    push(` function ${functionName}(${signature}){`)
    push('return ')

    genNode(ast.codegenNode, push)
    push('}')
    

    return {
        code: context.code 
    }
}

// render 核心节点 加入
function genNode(node: any, push) {
    // 基于ast 完善render函数主体内容
    switch (node.type) {
        case NodeTypes.TEXT: // 处理text类型
            genText(node, push)
            break;

        case NodeTypes.INTERPOLATION:  // 处理插值类型
            genInterpolation(node, push)
            break;

        case NodeTypes.SIMPLE_EXPRESSION:  // 处理简单表达式类型
            genSimpleExpression(node, push)
            break;
    
        default:
            break;
    }
    
    
}

// 创建一个code相关的全局上下文对象
function createCodegenContext() {
    const context = {
        code: '',
        push(source) {
            context.code += source
        },
    }
     return context
}

// 抽离导入资源类型代码
function genFunctionPreamble(push: (source: any) => void, ast: any) {
    
    // helperMapName 依赖资源映射表
    const vue = '"vue"'
    
    const aliasHelpers = (s) => `${helperMapName[s]} as _${helperMapName[s]}`
    
    // 判断当前是否需要导入资源，插值类型需要，但是text类型是不用的，因此这里判断一下
    if (ast.helpers.length > 0) {
        push(`import { ${ast.helpers.map(aliasHelpers).join(", ")} } from ${vue} `)
        push('\n')
    }

}

// render 核心节点 加入 text类型处理
function genText(node: any, push: any) {
    push(`"${node.content}"`)
}

// render 核心节点 加入 插值类型处理
function genInterpolation(node: any, push: any) {
    push(`_${helperMapName[TO_DISPLAY_STRING]}(`)
    genNode(node.content, push)
    push(')')
}

// render 核心节点 加入 简单表达式类型处理
function genSimpleExpression(node: any, push: any) {
    push(`${node.content}`)
}

