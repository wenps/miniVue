import { NodeTypes } from "./ast"
enum TagType  {
    start,
    end
}

export function baseParse(content:string) {

    // 创建一个全局上下文对象，包裹传进来的 content
    const context = createParserContext(content)

    return createRoot(parseChildren(context))
}

// 封装content逻辑
function createParserContext(content: string) {
    return {
     source:content
    }
 }

// 抽离根节点逻辑
function createRoot(children) {
    return {
        children
    }
}

// 抽离children节点逻辑
function parseChildren(context) {
    const nodes:any = [] // 创建节点列表
    let node;
    const s = context.source
    // 判断是否插值类型节点
    if(s.startsWith('{{')) {
        node = parseInterpolation(context) // 解析插值类型
    } 
    // 判断是否元素类型节点，是否以 < 开头，第二个字段是否a-z中的字符
    else if (s[0] === '<') {
        if(/[a-z]/i.test(s[1])) {
            node = parseElement(context) // 解析元素类型
        }
    }
    nodes.push(node) // 设置节点列表
    return nodes
}

// 抽离插值类型节点逻辑
function parseInterpolation(context) {

    const openDelimiter = '{{' 
    const closeDelimiter = '}}'

    // 下述操作相当于 获取 {{message}} 中的 message，截取插值类型内容
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length) // 拿到 }} 下标
    advanceBy(context, openDelimiter.length) // 拿到 message}} ， 推进两位 {{
    const rawContentLength = closeIndex - openDelimiter.length 
    const rawContent = context.source.slice(0, rawContentLength) // 拿到 message, 即原始数据
    const content = rawContent.trim()
    advanceBy(context, rawContentLength + closeDelimiter.length) // 推进 message.length + 2 位 （上面推进了{{ 和 message.length + 2 位 这样子 {{message}}整体被推进完了）
    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION, 
            content: content
        }
    }
}

function parseElement(context) {
    const element = parseTag(context, TagType.start) // 处理开头标签
    parseTag(context, TagType.end) // 处理结束标签
    return element
    
}

function parseTag(context: any, type: TagType) {
    // 1.解析tag
    const match: any = /^<\/?([a-z]*)/i.exec(context.source) // 标签解析正则
    const tag = match[1]
    // 2.处理后的代码推进
    advanceBy(context, match[0].length + 1) // 推进掉<div + >

    if(type == TagType.start) { // 如果是开头标签就返回
        return {
            type: NodeTypes.ELEMENT,
            tag,
        }
    }
}

// 封装推进代码
function advanceBy(context:any, length:number) {
    context.source = context.source.slice(length)
}
