import {baseParse} from "../src/parse";

describe('parse', ()=>{
    describe('interpolation',()=>{
        test('simple interpolation', ()=>{
            // 处理插值的测试用例
            const ast = baseParse('{{ message }}')

            expect(ast.children[0]).toStrictEqual({
                type: 'interpolation',
                content: {
                    type: 'simple_expression', // 简单表达式
                    content: 'message'
                }
            })
        })
    })
})