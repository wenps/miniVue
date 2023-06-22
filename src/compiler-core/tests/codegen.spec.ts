import { generate } from "../src/codegen"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"
import { transformExpression } from "../src/transforms/transformExpression"

describe('codegen', ()=>{
    it('happy pass',()=>{
        const ast = baseParse('hi')

        transform(ast)

        const { code } = generate(ast)

        // 快照测试
        expect(code).toMatchSnapshot()
    })
    it('happy pass',()=>{
        const ast = baseParse('{{message}}')

        transform(ast, {
            nodeTransforms: [transformExpression] // 加上一个插件，设置插值类型下，普通表达式的 render函数格式 , 这里是加了_ctx.
        })

        console.log(ast);
        

        const { code } = generate(ast)

        // 快照测试
        expect(code).toMatchSnapshot()
    })
})