import { NodeTypes } from "./ast"
enum TagType  {
    start,
    end
}

export function baseParse(content:string) {

    // 创建一个全局上下文对象，包裹传进来的 content
    const context = createParserContext(content)

    return createRoot(parseChildren(context, []))
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
// elementTagStack 元素标签栈，用来存储元素标签，判断标签是否闭合等关系
// 抽离children节点逻辑
function parseChildren(context, elementTagStack ) {
    const nodes:any = [] // 创建节点列表

    // 循环解析节点内容，当context推进完之后结束 或者 如果是解析元素标签时，遇到闭合标签也要结束
    while (!isEnd(context, elementTagStack )) {

        let node;
        const s = context.source
        // 判断是否插值类型节点
        if(s.startsWith('{{')) {
            node = parseInterpolation(context) // 解析插值类型
        } 
        // 判断是否元素类型节点，是否以 < 开头，第二个字段是否a-z中的字符
        else if (s[0] === '<') {
            if(/[a-z]/i.test(s[1])) {
                node = parseElement(context, elementTagStack) // 解析元素类型
            }
        }
        // 处理text类型节点，默认情况下如果没有命中元素也没有命中插值即取不到node，默认为text
        if(!node) { 
            node = parseText(context)
        }

        nodes.push(node) // 设置节点列表
    }

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

// 解析元素类型
function parseElement(context, elementTagStack ) {
    const element:any = parseTag(context, TagType.start) // 处理开头标签

    // 标签入栈
    elementTagStack.push(element)

    element.children = parseChildren(context, elementTagStack) // 读取元素类型标签内容，递归解析， 如： <div>xx, {{a}}</div> 上一步推进一个标签 得到 xx, {{a}}</div>，递归解析这个字符串
    // 同时要传入当前元素的标签，用于处理children递归的结束条件

    // 递归解析完，标签出栈
    elementTagStack.pop()

    // 判断结束标签和当前标签是否相同，如果相同则，才能处理这个结束标签做推进
    if (context.source.slice(2, 2 + element.tag.length) == element.tag) {
      parseTag(context, TagType.end) // 处理结束标签
    } else {
        throw new Error("标签不闭合");   
    }
    return element
    
}

// 解析元素类型的tag
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

// 解析text类型
function parseText(context: any): any {

    let endIndex = context.source.length // 默认整个字符串都是text类型
    let endTokens = ["<", "{{"]

    for (let i = 0; i < endTokens.length; i++) {
        let index = context.source.indexOf(endTokens[i]) // 判断当前是否出现了非text类型的标识，如果出现则0到当前下标则为text类型节点内容
        if(index != -1 && endIndex > index) { // 取最左的下标
            endIndex = index
        }
    }

    // 1.获取text内容
    const content = context.source.slice(0, endIndex)
    // 2.推进
    advanceBy(context, content.length)

    return {
        type: NodeTypes.TEXT,
        content
    }
}

// 封装推进代码
function advanceBy(context:any, length:number) {
    context.source = context.source.slice(length)
}

// 循环解析节点内容结束条件
function isEnd(context:any, elementTagStack) {
    // 2.当遇到结束标签时，结束
    const s = context.source
    console.log(s,'xxx', elementTagStack)
    // if(parentTag && s.startsWith(`</${parentTag}>`)) { // 动态传入结束标签
    //     return true
    // }
    // 如果当前是解析到结束标签，并匹配到闭合
    if(s.startsWith('</')) {
        // 判断当前闭合标签，是否出现元素标签栈中
        for(let i = elementTagStack.length - 1; i >= 0; i--) {
            const tag = elementTagStack[i].tag
            if (s.slice(2, 2 + tag.length) ==  tag) {
                return true
            }
        }
    }
    // 1.当context.source的内容推进完了，结束
    return !s
}
