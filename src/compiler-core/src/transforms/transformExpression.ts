import { NodeTypes } from "../ast";

// 设置插值类型下，普通表达式的 render函数格式 , 这里是加了_ctx.
export function transformExpression(node) {
    if(node.type == NodeTypes.INTERPOLATION) {
        const rawContent = node.content.content
        node.content.content = "_ctx." + rawContent
    }
}