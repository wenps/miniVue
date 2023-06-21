export function generate(ast) {

    const context = createCodegenContext()
    const {push} = context

    // 组装成render函数
    push('return')
    const functionName = "render"
    const args = ['_ctx', '_cache']
    const signature = args.join(",")

    push(` function ${functionName}(${signature}){`)

    genNode(ast.codegenNode, push)
    push('}')
    

    return {
        code: context.code 
    }
}

function genNode(node: any, push) {
    // 基于ast获取render函数内容
    console.log(node);
    push(`return "${node.content}"`)
}

// 创建一个code相关的全局上下文对象
function createCodegenContext() {
    const context = {
        code: '',
        push(source) {
            context.code += source
        }
    }
     return context
}

