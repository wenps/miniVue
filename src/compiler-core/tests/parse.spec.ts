import { NodeTypes } from "../src/ast";
import {baseParse} from "../src/parse";

describe('parse', ()=>{
    describe('interpolation',()=>{
        test('simple interpolation', ()=>{
            // 处理插值的测试用例
            const ast = baseParse('{{ message }}')

            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION, // 简单表达式
                    content: 'message'
                }
            })
        })
    })
    describe('element',()=>{
        test('simple element', ()=>{
            // 处理元素的测试用例
            const ast = baseParse('<div></div>')

            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: 'div',
                children: []
            })
        })
    })
    describe('text',()=>{
        test('simple text', ()=>{
            // 处理元素的测试用例
            const ast = baseParse('some text')

            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.TEXT,
                content: 'some text'
            })
        })
    })
    test('hello world', () => {
        const ast = baseParse("<p>hi,{{message}}</p>")
        console.log(ast.children[0])
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'p',
            children: [
                {
                    type: NodeTypes.TEXT,
                    content: 'hi,'
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION, // 简单表达式
                        content: 'message'
                    }
                }
            ]
        })
    })
    test('hello world', () => {
        const ast = baseParse("<div><p>xxx</p><div>hi,{{message}}</div></div>")
        console.log(ast.children[0])
        expect(ast.children[0]).toStrictEqual(
            {
                type: NodeTypes.ELEMENT,
                tag: 'div',
                children: [
                    {
                        type: NodeTypes.ELEMENT,
                        tag: 'p',
                        children: [
                            {
                                type: NodeTypes.TEXT,
                                content: 'xxx'
                            },
                        ]
                    },
                    {
                        type: NodeTypes.ELEMENT,
                        tag: 'div',
                        children: [
                            {
                                type: NodeTypes.TEXT,
                                content: 'hi,'
                            },
                            {
                                type: NodeTypes.INTERPOLATION,
                                content: {
                                    type: NodeTypes.SIMPLE_EXPRESSION, // 简单表达式
                                    content: 'message'
                                }
                            }
                        ]
                    }
                ],
            }
        )
    })
    test('hello world', () => {
        // baseParse("<p><span></p>")
        // 标签不闭合，异常情况
        expect(()=>{
            const ast = baseParse("<p><span></p>")
        }).toThrow("标签不闭合")
    })
})