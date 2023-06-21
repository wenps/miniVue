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
                tag: 'div'
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
})