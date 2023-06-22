export const enum NodeTypes {
    INTERPOLATION = 'interpolation', // 插值类型，如 {{message}}
    SIMPLE_EXPRESSION = 'simple_expression', // 简单表达式，如 xiaoshan
    ELEMENT = 'element', // 元素类型
    TEXT = 'text', // 文本类型
    ROOT = 'root', // 根节点
    COMPOUND_EXPRESSION = 'compound_expression', // 复合类型，集合了插值和文本
}